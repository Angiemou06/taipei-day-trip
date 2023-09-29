import json
from flask import Flask, request, render_template, redirect, session, jsonify
import mysql.connector

# 讀取 JSON 檔案
with open('taipei-attractions.json') as json_file:
    data = json.load(json_file)
data = data["result"]["results"]


def connect_to_database():
    try:
        con = mysql.connector.connect(
            user="root",
            password="123456",
            host="localhost",
            database="taipei_day_trip"
        )
        cursor = con.cursor()
        return con, cursor
    except:
        return None, None


con, cursor = connect_to_database()

for i in range(0, len(data)):
    name = data[i]["name"]
    category = data[i]["CAT"]
    description = data[i]["description"]
    address = data[i]["address"]
    transport = data[i]["direction"]
    longitude = data[i]["longitude"]
    latitude = data[i]["latitude"]
    MRT = data[i]["MRT"]
    open_time = data[i]["MEMO_TIME"]

    cursor.execute("INSERT INTO attraction(name,category,description,transport,address,longitude,latitude,MRT,opentime) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                   (name, category, description, transport, address, longitude, latitude, MRT, open_time))
    con.commit()
    attraction_id = cursor.lastrowid
    file = data[i]["file"].lower()
    file = file.split("https://")
    for j in range(0, len(file)):
        if file[j] != "":
            URL = "https://"+file[j]
            cursor.execute(
                "INSERT INTO figure(attraction_id,URL) VALUES (%s,%s)", (attraction_id, URL))
            con.commit()
con.close()
