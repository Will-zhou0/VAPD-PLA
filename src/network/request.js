import axios from "axios";

export function request(config) {
    // 1、创建axios的实例
    const instance = axios.create({
        baseURL: "http://127.0.0.1:5000",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json;charset=UTF-8'
        },
        // timeout: 5000 // 最大响应时间
    })

    // 2.2 响应拦截
    instance.interceptors.response.use(res => {
        // console.log(res);
        return res.data
    }, err => {
        console.log(err);
    })
    return instance(config)
}