from flask import Flask, jsonify, request
from pymongo import MongoClient

app = Flask(__name__)

# 连接 MongoDB
client = MongoClient('mongodb://localhost:27017/')

# 选择数据库和集合
db = client['mydb']
collection = db['mycollection']

# 定义接口
@app.route('/api/data', methods=['POST'])
def get_data():
    # 查询数据
    # selected_nodes = ['1_1', '1_3', '1_4']
    # 获取传入的参数
    selected_nodes = request.json['selected_nodes']
    # selected_nodes = request.form.getlist('selected_nodes')
    data = collection.find({'from': {'$in': selected_nodes}, 'to': {'$in': selected_nodes}})

    # 转化为数组
    result = []
    for item in data:
        result.append([item['from'], item['to'], item['value']])
    # 返回 JSON 格式的数据
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)

# 启动应用程序后，可以在前端使用 http://localhost:5000/api/data 接口