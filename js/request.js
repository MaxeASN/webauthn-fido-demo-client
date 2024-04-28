(function (win) {

    // 创建axios实例
    const service = axios.create({
        // axios中请求配置有baseURL选项，表示请求URL公共部分
        baseURL: '/',
        // 超时
        timeout: 1000000
    })
    // 响应拦截器
    service.interceptors.response.use(res => {
            if (res.status === 400) {// 返回登录页面
                console.log('---/backend/page/login/login.html---')
                localStorage.removeItem('userInfo')
                app.showErrorMessage("登录超时")
                window.top.location.href = '/login.html'
            } else {
                return res.data
            }
        },
        error => {
            console.log('err' + error)
            let { message } = error;
            if (message == "Network Error") {
                message = "后端接口连接异常";
            }
            else if (message.includes("timeout")) {
                message = "系统接口请求超时";
            }
            else if (message.includes("Request failed with status code")) {
                message = "系统接口" + message.substr(message.length - 3) + "异常";
            }
            window.ELEMENT.Message({
                message: message,
                type: 'error',
                duration: 5 * 1000
            })
            return Promise.reject(error)
        }
    )
    win.$axios = service
})(window);
