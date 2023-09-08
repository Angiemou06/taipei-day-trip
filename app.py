from flask import *
import mysql.connector.pooling
from collections import Counter
from flask_cors import CORS

cors = CORS(app)

db_config = {
    "pool_name": "mypool",
    "pool_size": 10,
    "host": "localhost",
    "user": "angie",
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

@app.route("/api/attractions", methods=["GET"])
def attractions():
    def sortpage(page):
        try:
            page = int(page)
            if page < 0:
                response_data = {
                    "error": True,
                    "message": "頁面參數最小值為０"
                }
                response = json.dumps(response_data, ensure_ascii=False)
                return response, 500, {"Content-Type": "application/json"}

            offset = page * 12
            con, cursor = connect_to_database()
            cursor.execute("SELECT COUNT(*) FROM attraction")
            number = cursor.fetchone()[0]
            cursor.execute("SELECT * FROM attraction LIMIT 12 OFFSET %s", (offset,))
            result = cursor.fetchall()
            con.close()
            attractions_data = []
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
                cursor.execute("SELECT * FROM figure WHERE attraction_id = %s", (id,))
                fig_result = cursor.fetchall()
                fig = []
                for row in fig_result:
                    fig.append(fig_result[0][2])
                data = {
                    "id": id,
                    "name": name,
                    "category": category,
                    "description": description,
                    "address": address,
                    "transport": transport,
                    "MRT": MRT,
                    "lat": latitude,
                    "lng": longitude,
                    "images": fig
                }
                attractions_data.append(data)
            limit_page = number // 12
            if page < limit_page:
                nextPage = page + 1
            elif page == limit_page:
                nextPage = None
            else:
                response = {
                    "error": True,
                    "message": "頁數超過資料範圍"
                }
                response = json.dumps(response, ensure_ascii=False)
                return response, 500, {"Content-Type": "application/json"}
            response = {
                "nextPage": nextPage,
                "data": attractions_data
            }
            response = json.dumps(response, ensure_ascii=False)
            return response, 200, {"Content-Type": "application/json"}

        except ValueError:
            response_data = {
                "error": True,
                "message": "頁面參數必須為整數"
            }
            response = json.dumps(response_data, ensure_ascii=False)
            return response, 500, {"Content-Type": "application/json"}

    page = request.args.get("page")
    keyword = request.args.get("keyword")
    if page is None:
        response_data = {
            "error": True,
            "message": "缺少頁面參數"
        }
        response = json.dumps(response_data, ensure_ascii=False)
        return response, 500, {"Content-Type": "application/json"}
    if keyword:
        con, cursor = connect_to_database()
        cursor.execute("SELECT COUNT(*) FROM attraction WHERE MRT = %s OR name LIKE %s", (keyword, "%" + keyword + "%"))
        # 如果有設index，SELECT COUNT就會很快。
        number = cursor.fetchone()[0]
        if number == 0:
            response_data = {
                "error": True,
                "message": "沒有相關資料"
            }
            response = json.dumps(response_data, ensure_ascii=False)
            return response, 500, {"Content-Type": "application/json"}
        page = int(page)
        limit_page = number // 12
        if page < limit_page:
            nextPage = page + 1
        elif page == limit_page:
            nextPage = None
        else:
            response = {
                 "error": True,
                "message": "頁數超過資料範圍"
            }
            response = json.dumps(response, ensure_ascii=False)
            return response, 500, {"Content-Type": "application/json"}
        offset = page * 12
        cursor.execute("SELECT * FROM attraction WHERE MRT = %s OR name LIKE %s LIMIT 12 OFFSET %s",
                       (keyword, "%" + keyword + "%", offset))
        result = cursor.fetchall()
        con.close()
        if len(result) == 0:
            return sortpage(page)
        else:
            if page < 0:
                response_data = {
                    "error": True,
                    "message": "頁面參數最小值為０"
                }
                response = json.dumps(response_data, ensure_ascii=False)
                return response, 500, {"Content-Type": "application/json"}
            attractions_data = []
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
                cursor.execute("SELECT * FROM figure WHERE attraction_id = %s", (id,))
                # SELECT attraction.*, GROUP_CONCAT(images.images_link) AS images_links  #GROUP_CONCAT 一次把同一個編號的資料都取出來
                # FROM attraction
                # LEFT JOIN images ON attraction.id = images.attraction_id
                # WHERE mrt = %s OR name LIKE %s
                # GROUP BY attraction.id
                # LIMIT %s, %s
                fig_result = cursor.fetchall()
                fig = []
                for row in fig_result:
                    fig.append(fig_result[0][2])
                data = {
                    "id": id,
                    "name": name,
                    "category": category,
                    "description": description,
                    "address": address,
                    "transport": transport,
                    "MRT": MRT,
                    "lat": latitude,
                    "lng": longitude,
                    "images": fig
                }
                attractions_data.append(data)
            response = {
                "nextPage": nextPage,
                "data": attractions_data
            }
            response = json.dumps(response, ensure_ascii=False)
            return response, 200, {"Content-Type": "application/json"}
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
			con.close()
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
    # SELECT a.mrt 
    # FROM attractions a
    # GROUP BY a.mrt
    # ORDER BY COUNT(*) DESC, a.mrt;

    # 可以去檢測這個COUNT效率好不好，該如何優化，可以用EXPLAIN＋索引看能不能優化，假如不行，可以考慮要不要做快取，做完之後把結果先存起來放在全域變數裡，可以從裡面拿就好，比較快，但要注意資料更新時變數需要更新（空間換取時間）

	response = json.dumps(response, ensure_ascii=False)
	return response ,200, {"Content-Type": "application/json"}
app.run(host='0.0.0.0', port=4000)


