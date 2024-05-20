import { Core } from '@walletconnect/core'
import { Web3Wallet } from '@walletconnect/web3wallet'
// import the builder util
import {buildApprovedNamespaces, getSdkError} from "@walletconnect/utils";

const core = new Core({
    projectId: "79b03f2cc2d4c4860a66eae8bfce2d5f"
})

let web3wallet = await Web3Wallet.init({
    core, // <- pass the shared `core` instance
    metadata: {
        name: "fido-client",
        description: "A web3 app using fido",
        url: "https://localhost:30000",
        icons: ["https://asn.aspark.space/img/icons/favicon.ico"],
    }
}).catch(()=>{console.error("walletConnect初始化失败，请确保开启了vpn")})

web3wallet && web3wallet.on("session_proposal", async (sessionProposal) => {
    let username = localStorage.getItem("username");
    let selectAddress;
    if(username && localStorage.getItem(username + "_select_address")){
        selectAddress = localStorage.getItem(username + "_select_address");
    }else{
        throw new Error("获取选择的address出错");
    }
    console.log("开始建立连接")
    console.log("sessionProposal:", sessionProposal)
    const { id, params } = sessionProposal;

    // ------- namespaces builder util ------------ //
    let approvedNamespaces
    try {
        approvedNamespaces = buildApprovedNamespaces({
            proposal: params,
            supportedNamespaces: {
                eip155: {
                    chains: ["eip155:1","eip155:5"],
                    methods: ["eth_sendTransaction", "personal_sign", 'eth_signTypedData_v4'],
                    events: ["accountsChanged", "chainChanged"],
                    accounts: ["eip155:1:"+selectAddress, "eip155:5:"+selectAddress]
                },
            },
        });
    } catch (e) {
        app.closeFullScreen1();
        app.showErrorMessage('Connection failed.');
        throw new Error(e)
    }
    // ------- end namespaces builder util ------------ //

    const session = await web3wallet.approveSession({
        id,
        namespaces: approvedNamespaces,
    }).catch((err)=>{
        app.closeFullScreen1();
        app.showErrorMessage('Connection failed.');
        throw new Error(err)
    });
    console.log("连接成功，we3wallet:",web3wallet)
    app.closeFullScreen1();
    closeScan();
    app.walletConnecting = true;
});

web3wallet && web3wallet.on('session_request', async event => {
    console.log("event:",event)
    const { topic, params, id } = event
    if(params.request.method === "eth_sendTransaction"){
        const {data,from,gas,to,value} = params.request.params[0];
        let amount = hexWeiToEth(value)
        let confirmNodeParent = document.querySelector("webauthn-transaction").parentNode;
        confirmNodeParent.removeChild(document.querySelector("webauthn-transaction"));
        let confirmTitleNode = document.getElementById("title-confirm");
        confirmTitleNode.insertAdjacentHTML("afterend", `<webauthn-transaction symbol='ETH' amount=${amount} from=${from} to=${to} data=${data}></webauthn-transaction>`);
        addCancelEvent();
        await addConfirmTransactionEvent(id, topic, from,to,amount,data)
        document.getElementById("transaction-confirm").setAttribute("style", "z-index: 2012;");
        browserNotify("MaxeLabs","You have a transaction pending.")
    } else if(params.request.method === "personal_sign"){
        // let signature = personalSign(params.request.params);
        // const response = {id, result: signature, jsonrpc: '2.0'};
        // console.log(response)
        // await web3wallet.respondSessionRequest({topic, response});

        const dataHash = web3.eth.accounts.hashMessage(params.request.params[0])
        console.log("originData:",params.request.params[0])
        console.log("dataHash:",dataHash)
        const requestParams = {
            "jsonrpc": "2.0",
            "id": 0,
            "method":"maxe_sign",
            "params": [3328, "0x6b4825a86698c4cf967a35c6e034c9fa76465383",dataHash.replace("0x","")]
        }
        fetch("https://asn.aspark.space/sign", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(requestParams)
        })
            .then(response => response.json())
            .then(async result => {
                if (result.error) {
                    throw new Error(result.error.message);
                }
                const signature = "0x" + result.result.signature;
                console.log("签名结果:", signature);
                const response = {id, result: signature, jsonrpc: '2.0'};
                await web3wallet.respondSessionRequest({topic, response});
            })
            .catch(error => {
            // 捕获和处理错误
            console.error('Error:', error.message);
        })
    }
})

web3wallet && web3wallet.on("session_delete", ()=>{
    console.log("断开连接了")
    app.walletConnecting = false;
})

if(web3wallet && Object.keys(web3wallet.getActiveSessions()).length !== 0){
    app.walletConnecting = true;
}

async function pasteUriAndConnect(){
    if(!web3wallet){
        alert("walletConnect初始化失败，请打开vpn再刷新页面重试")
        return
    }
    let uri;
    let wcSession = web3wallet.getActiveSessions();
    console.log("wcSession:", wcSession)
    if(Object.keys(wcSession).length === 0){
        if (navigator.clipboard) {
            await navigator.clipboard.readText().then(function(text) {
                console.log("从剪贴板获取的文本：", text);
                uri = text;
            }).catch(function(err){
                alert("无法从剪贴板读取文本：" + err);
                throw new Error("无法从剪贴板读取文本：" + err);
            });
        } else {
            alert("浏览器不支持 Clipboard API");
            return;
        }
    }else{
        alert("存在一个walletConnect连接，请先断开再重新连接")
        return;
    }

    app.openFullScreen1();
    await web3wallet.core.pairing.pair({ uri }).catch((err)=>{
        app.closeFullScreen1();
        app.showErrorMessage('Connection failed, Please check your pasted uri.');
        throw new Error(err)
    })
}

document.getElementById("walletConnectButton").addEventListener("click", pasteUriAndConnect)

async function disconnectDapp(){
    app.walletConnecting = false;
    let topic = Object.keys(web3wallet.getActiveSessions())[0];
    if (topic) {
        await web3wallet.disconnectSession({
            topic,
            reason: getSdkError('USER_DISCONNECTED')
        })
            .then(()=>{console.log("断开连接了")})
            .catch((err) => {
            console.error("断开连接失败：" + err)
        })
    }
}

document.querySelector(".right.up-chain").addEventListener("click",async ()=>{
    web3wallet && await disconnectDapp();
})

document.getElementById("logout").addEventListener("click",async ()=>{
    web3wallet && await disconnectDapp();
    Cookies.remove("JSESSIONID");
    window.location.href = "/home";
})

async function addCancelEvent(){
    let webauthnTransaction = document.querySelector('webauthn-transaction');
    let cancelButton = webauthnTransaction.shadowRoot.querySelector('#confirm-button-cancel');
    cancelButton.addEventListener('click', function (){
        document.getElementById("transaction-confirm").setAttribute("style", "z-index: 2012; display: none");
    })
}

async function addConfirmTransactionEvent(id, topic, from,to,amount,data){
    let webauthnTransaction = document.querySelector('webauthn-transaction');
    let confirmButton = webauthnTransaction.shadowRoot.querySelector('#confirm-button-yes');
    confirmButton.addEventListener('click', async function (){
        await confirmTransaction(from, to, amount, data)
            .then(async transactionHash => {
                console.log("l2上的交易hash为:", transactionHash)
                app.closeFullScreen1();
                alert("The transaction was successful. Please do not close the current page and wait for the other side of the transaction to complete.")
                const receipt = await pollTransactionStatus(transactionHash);
                const seqNum = receipt.logs[2].topics[3];
                const username = localStorage.getItem("username")
                const contractAddress = localStorage.getItem(username + "_contract_address")
                const contract = new web3.eth.Contract(simpleAccountAbi, contractAddress);
                const methodParams = [from, seqNum];
                // 开始轮询的时间戳
                const startTime = Date.now();
                // 定义轮询间隔（毫秒）
                const pollInterval = 1000;
                // 定义轮询超时时间（毫秒）
                const timeout = 120000;
                // 设置轮询定时器
                const pollTimer = setInterval(() => {
                    // 执行查询操作
                    contract.methods.getL1Txhash(...methodParams).call()
                        .then(result => {
                            console.log('调用合约方法的结果:', result);

                            // 在这里处理返回的结果

                            // 如果结果不为null，停止轮询
                            if (result !== null && result.length === 66) {
                                clearInterval(pollTimer);
                                const response = {id, result: result, jsonrpc: '2.0'};
                                web3wallet.respondSessionRequest({topic, response})
                                browserNotify("MaxeLabs","Transaction Success!")
                            }
                        }).catch(error => {console.error('调用账户合约查询l1上的hash出错:', error)});

                    // 检查是否达到轮询超时时间，如果是则停止轮询
                    if (Date.now() - startTime >= timeout) {
                        app.closeFullScreen1();
                        clearInterval(pollTimer);
                        console.log('轮询已超时');
                        alert("查询交易结果超时，请自行查询交易结果")
                    }
                }, pollInterval);
            }).catch(error => {app.closeFullScreen1(); console.error('交易出错:', error);});
    })
}

async function confirmTransaction(from, to, amount, data){
    app.openFullScreen1()
    let assertionStartUrl = SERVER + "/api/transaction/start", assertionFinishUrl = SERVER + "/api/transaction/finish", fetchOptions = {
        method: "POST",
        credentials: "include",
        headers: {"Content-Type": "application/json"}
    }
    try {
        if (!window.PublicKeyCredential) throw new Error("Web Authentication is not supported on this platform");
        window.dispatchEvent(new CustomEvent("login-started"));
        // const e0 = new FormData(t.target).get('coinSelect'), e1 = new FormData(t.target).get('toAddress'), e2 =  new FormData(t.target).get('amount');
        const symbolEnum = getSymbolEnum('ETH');
        const n = await fetch(assertionStartUrl, {
            ...fetchOptions,
            body: JSON.stringify({coin: symbolEnum, fromAddress: from, toAddress: to, amount: amount, data: data})
        }), {assertionId: i, publicKeyCredentialRequestOptions: s, requestParams: p} = await n.json();
        if (!n.ok) throw new Error("Could not successfuly start login");
        if(p.toAddress != to || p.amount != amount || p.fromAddress != from || data ? (p.data != data):0) throw new Error("The transaction content has been changed!");
        const r = await _getPublicKeyCredentialRequestOptionsDecoder(),
            o = await navigator.credentials.get({publicKey: r(s)});
        window.dispatchEvent(new CustomEvent("login-retrieved"));
        const a = await _getLoginCredentialEncoder(), u = await fetch(assertionFinishUrl, {
            ...fetchOptions,
            body: JSON.stringify({assertionId: i, credential: a(o)})
        });
        if (!u.ok) throw new Error("调用接口出错");
        const {code: c, message:m, data:d} = await u.json();
        if (c != 1) {
            throw new Error(m);
        }
        // document.getElementById("transaction-confirm").setAttribute("style", "z-index: 2012; display: none");
        // alert("交易成功")
        window.dispatchEvent(new CustomEvent("login-finished", {detail: {code: c, message:m, data:d}}))
        return d.transactionHash
    } catch (t) {
        window.dispatchEvent(new CustomEvent("login-error", {detail: {message: t.message}}))
        throw new Error(t.message);
    }
}

async function _getPublicKeyCredentialRequestOptionsDecoder() {
    const {decodePublicKeyCredentialRequestOptions: e} = await import("./utils/parse.js");
    return e
}

async function _getLoginCredentialEncoder() {
    const {encodeLoginCredential: e} = await import("./utils/parse.js");
    return e
}