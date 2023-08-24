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
    pocketData = ['1_1', '1_3', '1_4','2_5','2_8']
    # 根据传来的口袋编号 找到对应的口袋及其属性 比如体积vol、距离dist等
    data = collection.find({'frame_pocket': {'$in': pocketData}})

    # 转化为数组
    result = {}
    # 结果返回的格式为 {vol:[[0, 5],[1, 1],[2, 0]], dist:[[0, 5],[1, 1],[2, 0]]}
    # 格式为{属性名:[值]}
    for i in data:
        result[i['frame_pocket']] = [i['frame'],i['frame_volume']]
    print(result)
    return result

if __name__ == '__main__':
    app.run(debug=True)

# 启动应用程序后，可以在前端使用 http://localhost:5000/api/data 接口