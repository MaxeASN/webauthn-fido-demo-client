function formatBalance(balance){
    let strNum = balance.toString(); // 将num转换为字符串
    let index = strNum.indexOf('.');
    if (strNum.substring(index+1) > 4) {
        let result = strNum.slice(0, index + 5); // 截取小数点前4位和小数点后一位

// 判断小数的第三位和第四位是否为0
        if (strNum.charAt(index + 3) === '0' && strNum.charAt(index + 4) === '0') {
            result = strNum.slice(0, index + 3); // 取小数点前两位和小数点后一位
        }
        //判断小数是否只有第四位为0
        if (strNum.charAt(index + 3) !== '0' && strNum.charAt(index + 4) === '0') {
            result = strNum.slice(0, index + 4); // 取小数点前两位和小数点后一位
        }
        return result;
    }
    return balance;
}

/**
 * 16进制的单位wei转为10进制的eth
 * @param hexValue
 * @returns {number}
 */
function hexWeiToEth(hexValue) {
    // 将十六进制转换为十进制
    const decimalValue = parseInt(hexValue, 16);

    // 将十进制除以 10^18
    let ethValue = decimalValue / Math.pow(10, 18);

    return ethValue;
}

function getSymbolEnum(symbol){
    switch (symbol) {
        case "ETH":
            return 1;
        case "USDT":
            return 5;
        case "USDC":
            return 9;
    }
}

function pollTransactionStatus(transactionHash) {
    return new Promise((resolve, reject) => {
        const checkInterval = setInterval(async () => {
            try {
                const receipt = await web3.eth.getTransactionReceipt(transactionHash);

                if (receipt) {
                    clearInterval(checkInterval);
                    resolve(receipt);
                }
            } catch (error) {
                clearInterval(checkInterval);
                reject(error);
            }
        }, 500); // 每0.5秒钟查询一次

        setTimeout(() => {
            clearInterval(checkInterval);
            reject(new Error("超过等待时间，交易未被确认。"));
        }, 30000); // 设置最大等待时间为30秒
    });
}

async function processBadResponse(code){
    if(code == 400){
        console.error("获取用户信息失败");
        app.showErrorMessage("登录超时，请重新登录")
        await waitSync(1500)
        window.location.href = "/login";
    }
}

async function processBadStatus(response){
    if(response.status === 400){
        console.error("登录超时");
        app.showErrorMessage("登录超时，请重新登录")
        await waitSync(1500)
        window.location.href = "/login";
    }
}

function waitSync(delay) {
    return new Promise(function(resolve) {
        setTimeout(resolve, delay);
    });
}

function browserNotify(title, content){
    if (Notification.permission === "granted") {
        // 如果用户已经允许通知权限，则创建通知
        var notification = new Notification(title, { body: content });
    } else if (Notification.permission !== "denied") {
        // 否则，向用户请求通知权限
        Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
                // 用户授予通知权限后，创建通知
                var notification = new Notification(title, { body: content });
            }
        });
    }
}

function parseTransactionState(stateNum){
    if(stateNum === "0"){
        return "GENERATED";
    }else if(stateNum === "1"){
        return "SENT";
    }else if(stateNum === "2"){
        return "PENDING";
    }else if(stateNum === "3"){
        return "SUCCESS";
    }

    return "FAILED";
}