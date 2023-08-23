from flask import Flask, request # 导入flask模块
from flask_cors import CORS


app = Flask(__name__) # 将当前模块注册为Flask实例
CORS(app=app, supports_credentials=True) # flask前后端跨域处理

# 支持get和post方法
@app.route(rule='/router', methods=['GET', 'POST'])
def upload():
    # GET请求
    if request.method == 'GET':
        print("get")
        print("请求参数为:",request.args.get('前端json格式的key'))
    # POST请求
    else:
        print("post")
        print("请求参数为:",request.args.post('前端json格式的key'))
        return 'success'

if __name__ == '__main__':
    app.run(port=80) # 服务器端口为80端口 (参数:host,port)
# 前端请求地址为ip:端口/函数上设置的路由
# 127.0.0.1:80/router?前端json格式的key