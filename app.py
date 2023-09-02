from flask import *
import mysql.connector.pooling
from collections import Counter

db_config = {
    "pool_name": "mypool",
    "pool_size": 10,
    "host": "localhost",
    "user": "root",
    "password": "123456",
    "database": "taipei_day_trip"
}
connection_pool = mysql.connector.pooling.MySQLConnectionPool(**db_config)

def connect_to_database():
    try:
        connection = connection_pool.get_connection()
        cursor = connection.cursor()

        return connection, cursor
    except:
        return None, None

app=Flask(__name__)
app.config["JSON_AS_ASCII"]=False
app.config["TEMPLATES_AUTO_RELOAD"]=True

# Pages
@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html")
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

@app.route("/api/attractions",methods=["get"])
def attractions():
	def sortpage(page):
		try:
			page = int(page)
			if page<0:
				response_data = {
					"error": True,
					"message": "頁面參數最小值為０"
				}
				response = json.dumps(response_data, ensure_ascii=False)
				return response ,500, {"Content-Type": "application/json"}
			
			offset = page*12
			con, cursor = connect_to_database()
			cursor.execute("SELECT COUNT(*) FROM attraction")
			number = cursor.fetchone()[0]
			cursor.execute("SELECT * FROM attraction LIMIT 12 OFFSET %s",(offset,))
			result = cursor.fetchall()
			attractions_data=[]
			for row in result:
				id = row[0]
				name = row[1]
				category = row[2]
				description = row[3]
				address = row[5]
				transport = row[4]
				MRT = row[8]
				latitude = row[7]
				longitude = row[6]
				cursor.execute("SELECT * FROM figure WHERE attraction_id = %s" , (id,))
				fig_result = cursor.fetchall()
				fig=[]
				for row in fig_result:
					fig.append(fig_result[0][2])
				data={
					"id": id,
					"name": name,
					"category":category,
					"description":description,
					"address":address,
					"transport":transport,
					"MRT":MRT,
					"lat":latitude,
					"lng":longitude,
					"images":fig
				}
				attractions_data.append(data)
			limit_page = number//12
			if page < limit_page:
				nextPage = page+1
			elif page == limit_page:
				nextPage = None
			else:
				response = {
					"error": True,
					"message": "頁數超過資料範圍"
				}
				response = json.dumps(response, ensure_ascii=False)
				return response ,500, {"Content-Type": "application/json"}	
			response = {
				"nextPage": nextPage,
				"data": attractions_data
			}
			response = json.dumps(response, ensure_ascii=False)
			return response ,200, {"Content-Type": "application/json"}
		
		except ValueError:
			response_data = {
				"error": True,
				"message": "頁面參數必須為整數"
			}
			response = json.dumps(response_data, ensure_ascii=False)
			return response ,500, {"Content-Type": "application/json"}
	page = request.args.get("page")
	keyword = request.args.get("keyword")
	if page is None :
		response_data = {
			"error": True,
  			"message": "缺少頁面參數"
		}
		response = json.dumps(response_data, ensure_ascii=False)
		return response ,500, {"Content-Type": "application/json"}
	if keyword:
		con, cursor = connect_to_database()
		cursor.execute("SELECT * FROM attraction WHERE MRT = %s  OR name LIKE %s" , (keyword,"%"+keyword+"%"))
		result = cursor.fetchall()
		con.close()
		if len(result)==0:
			return sortpage(page)
		else:
			try:
				page = int(page)
				if page<0:
					response_data = {
						"error": True,
						"message": "頁面參數最小值為０"
					}
					response = json.dumps(response_data, ensure_ascii=False)
					return response ,500, {"Content-Type": "application/json"}
				selectnumber = len(result)
				attractions_data=[]
				for row in result:
					id = row[0]
					name = row[1]
					category = row[2]
					description = row[3]
					address = row[5]
					transport = row[4]
					MRT = row[8]
					latitude = row[7]
					longitude = row[6]
					cursor.execute("SELECT * FROM figure WHERE attraction_id = %s" , (id,))
					fig_result = cursor.fetchall()
					fig=[]
					for row in fig_result:
						fig.append(fig_result[0][2])
					data={
						"id": id,
						"name": name,
						"category":category,
						"description":description,
						"address":address,
						"transport":transport,
						"MRT":MRT,
						"lat":latitude,
						"lng":longitude,
						"images":fig
					}
					attractions_data.append(data)
				limit_page = selectnumber//12
				if page < limit_page:
					nextPage = page+1
				elif page == limit_page:
					nextPage = None
				else:
					response = {
						"error": True,
						"message": "頁數超過資料範圍"
					}
					response = json.dumps(response, ensure_ascii=False)
					return response ,500, {"Content-Type": "application/json"}	
				response = {
					"nextPage": nextPage,
					"data": attractions_data
				}
				response = json.dumps(response, ensure_ascii=False)
				return response ,200, {"Content-Type": "application/json"}
			except ValueError:
				response_data = {
					"error": True,
					"message": "頁面參數必須為整數"
				}
				response = json.dumps(response_data, ensure_ascii=False)
				return response ,500, {"Content-Type": "application/json"}
			
	else:
		return sortpage(page)
@app.route("/api/attraction/<int:attractionId>",methods=["get"])
def attractionId(attractionId):
	if attractionId is None:
		response_data = {
			"error": True,
  			"message": "缺少景點id參數"
		}
		response = json.dumps(response_data, ensure_ascii=False)
		return response ,500, {"Content-Type": "application/json"}
	else:
		try:
			attractionId = int(attractionId)
			if attractionId<1:
				response_data = {
					"error": True,
					"message": "景點id參數最小編號為1"
				}
				response = json.dumps(response_data, ensure_ascii=False)
				return response ,400, {"Content-Type": "application/json"}
			con, cursor = connect_to_database()
			cursor.execute("SELECT * FROM attraction WHERE id=%s",(attractionId,))
			result = cursor.fetchall()
			attractions_data=[]
			for row in result:
				id = row[0]
				name = row[1]
				category = row[2]
				description = row[3]
				address = row[5]
				transport = row[4]
				MRT = row[8]
				latitude = row[7]
				longitude = row[6]
				cursor.execute("SELECT * FROM figure WHERE attraction_id = %s" , (id,))
				fig_result = cursor.fetchall()
				fig=[]
				for row in fig_result:
					fig.append(fig_result[0][2])
				data={
					"id": id,
					"name": name,
					"category":category,
					"description":description,
					"address":address,
					"transport":transport,
					"MRT":MRT,
					"lat":latitude,
					"lng":longitude,
					"images":fig
				}
				response = {
					"data": data
				}
			response = json.dumps(response, ensure_ascii=False)
			return response ,200, {"Content-Type": "application/json"}
		except ValueError:
			response_data = {
				"error": True,
				"message": "景點id參數必須為整數"
			}
			response = json.dumps(response_data, ensure_ascii=False)
			return response ,400, {"Content-Type": "application/json"}
		
@app.route("/api/mrts",methods=["get"])
def mrts():
	con, cursor = connect_to_database()
	cursor.execute("SELECT MRT FROM attraction")
	data = cursor.fetchall()
	con.close()
	data_list=[]
	for name in data:
		if name[0]!=None:
			data_list.append(name[0])
	element_count = Counter(data_list)
	sorted_elements = sorted(element_count.items(), key=lambda x: x[1], reverse=True)
	sort_list=[]
	for i in sorted_elements:
		sort_list.append(i[0])
	response={
  		"data": sort_list
	}
	response = json.dumps(response, ensure_ascii=False)
	return response ,200, {"Content-Type": "application/json"}
app.run(host='0.0.0.0', port=3000)


