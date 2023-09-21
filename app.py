from flask import *
import mysql.connector.pooling
from collections import Counter
from flask_cors import CORS
import jwt
import datetime

secret_key ="key123"

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
cors = CORS(app)

# Pages
@app.route("/")
def index():
	return render_template("index.html")
@app.route("/attraction/<id>")
def attraction(id):
	return render_template("attraction.html", id = id)
@app.route("/booking")
def booking():
	return render_template("booking.html")
@app.route("/thankyou")
def thankyou():
	return render_template("thankyou.html")

@app.route("/api/user",methods=["POST"])
def signup():
    data = request.get_json()
    name = data["name"]
    email = data["email"]
    password = data["password"]
    con, cursor = connect_to_database()
    cursor.execute("SELECT email FROM member WHERE email = %s", (email,))
    existing_user = cursor.fetchone()
    try:
        if name=="" or email=="" or password=="":
            con.close()
            return jsonify({"error": True, "message": "請輸入完整註冊資訊"}), 400
        elif existing_user is not None:
            return jsonify({"error": True, "message": "此信箱已被註冊"}), 400      
        else:
            cursor.execute("INSERT INTO member(name,email,password) VALUES (%s,%s,%s)",(name, email, password))
            con.commit()
            con.close()
            return jsonify({"ok": True, "message": "註冊成功"}), 200 
    except:
         return jsonify({"error": True, "message": "內部伺服器錯誤"}), 500
    
@app.route("/api/user/auth",methods=["PUT"])
def signin():
    data = request.get_json()
    email = data["email"]
    password = data["password"]
    con, cursor = connect_to_database()
    cursor.execute("SELECT id,name,email FROM member WHERE (email,password) = (%s,%s)", (email,password))
    existing_user = cursor.fetchone()
    con.close()
    try:
        if email=="" or password=="":
            return jsonify({"error": True, "message": "請完整輸入帳號及密碼資訊"}), 400
        elif existing_user is None:
            return jsonify({"error": True, "message": "帳號或密碼輸入錯誤"}), 400
        else:
            payload = {
                'id': existing_user[0],
                'name': existing_user[1],
                'email':existing_user[2],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
            }
            token = jwt.encode(payload, secret_key, algorithm='HS256')
            return jsonify({'token': token}), 200
    except:
        return jsonify({"error": True, "message": "內部伺服器錯誤"}), 500
               
@app.route("/api/user/auth",methods=["GET"])
def check():
    try:
        authorization_header = request.headers.get('Authorization')
        bearer_token = authorization_header.split(' ')[1]
        decoded_token = jwt.decode(bearer_token, secret_key, algorithms=['HS256'])
        id = decoded_token['id']
        name = decoded_token['name']
        email=decoded_token['email']
        data = {
            "data": {
                "id": id,
                "name": name,
                "email": email
            }
        }
        return jsonify(data), 200
    except:
          data ={
               "data":None
          }
          return jsonify(data), 401
     

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
                print(fig_result)
                fig = []
                for row in fig_result:
                    fig.append(row[2])
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
                    fig.append(row[2])
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
					fig.append(row[2])
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
app.run(host='0.0.0.0', port=3000)


