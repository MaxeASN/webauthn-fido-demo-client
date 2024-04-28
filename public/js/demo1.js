import WalletConnect from "@walletconnect/client";
import {Web3} from "web3";

// 创建 Web3 实例
const web3 = new Web3('https://goerli.infura.io/v3/ba60b163f0ad4e3a8f0c051511011cbd');

const clientMeta = {
    name: "fido-client",
    description: "A web3 app using fido",
    url: "http://localhost:3000/",
    icons: ["https://aspark.space/img/icons/favicon.ico"],
}

async function submitUri(){
    console.log("开始建立连接")
    let uri = document.getElementById("uri").value;
    // Create connector
    const connector = new WalletConnect({"uri":uri, "clientMeta":clientMeta})
    // Subscribe to session requests
    connector.on("session_request", (error, payload) => {
        if (error) {
            console.error("建立连接出错")
            throw error;
        }
        console.log("session_request payload:", payload)
        console.log("连接成功，connector:",connector)
        // Approve Session
        connector.approveSession({
            accounts: [                 // required
                '0xd6AF81D4b9E9C3fA2044E2FE3b7c052cA312575E',
            ],
            chainId: 5                  // required
        })
    });
    // Subscribe to call requests
    connector.on("call_request", (error, payload) => {
        if (error) {
            console.error(error)
            throw error;
        }
        console.log("call_request payload:", payload)

        let result;
        if(payload.method === "personal_sign"){
            result = personalSign(payload.params);
            console.log('Signature:'+result);
            // Approve Call Request
            connector.approveRequest({
                id: payload.id,
                result: result
            });
        }

    });
    connector.on("disconnect", (error, payload) => {
        if (error) {
            throw error;
        }
        console.log("断开连接了")

        // Delete connector
    });
}

function personalSign(params){
    const privateKey = '0x5b0dc78a4a58f97795443ac935851d38dea4ab9ad48e61678f61d58ca71ace7d';
    // 使用 personal_sign 方法对数据进行签名
    let signResult = web3.eth.accounts.sign(params[0], privateKey);
    console.log('SignResult:', signResult);
    return signResult.signature;

}

document.querySelector("button").addEventListener("click", submitUri);