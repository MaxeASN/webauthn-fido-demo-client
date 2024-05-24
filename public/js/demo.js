import { Core } from '@walletconnect/core'
import { Web3Wallet } from '@walletconnect/web3wallet'
// import the builder util
import {buildApprovedNamespaces} from "@walletconnect/utils";
import {Web3} from "web3";

const core = new Core({
    projectId: "7c7d77d54345b3a1be2adead27d0b787"
})

let web3wallet = await Web3Wallet.init({
    core, // <- pass the shared `core` instance
    metadata: {
        name: "fido-client",
        description: "A web3 app using fido",
        url: "https://localhost:3000",
        icons: ["https://aspark.space/img/icons/favicon.ico"],
    }
})

// 创建 Web3 实例
const web3 = new Web3('https://goerli.infura.io/v3/ba60b163f0ad4e3a8f0c051511011cbd');

async function submitUri(){
    let wcSession = web3wallet.getActiveSessions();
    console.log("web3WalletSession",web3wallet.getActiveSessions())
    // if(Object.keys(wcSession).length === 0){
    //     let uri = document.getElementById("uri").value;
    //     console.log(uri)
    //     await web3wallet.core.pairing.pair({ uri })
    // }else{
    //     console.log("存在一个连接，重新建立连接")
    // }
    let uri = document.getElementById("uri").value;
    console.log(uri)
    await web3wallet.core.pairing.pair({ uri })

    web3wallet.on("session_proposal", async (sessionProposal) => {
        console.log("开始建立连接")
        console.log("sessionProposal:",sessionProposal)
        const { id, params } = sessionProposal;

        // ------- namespaces builder util ------------ //
        const approvedNamespaces = buildApprovedNamespaces({
            proposal: params,
            supportedNamespaces: {
                eip155: {
                    chains: ["eip155:1","eip155:5"],
                    methods: ["eth_sendTransaction", "personal_sign"],
                    events: ["accountsChanged", "chainChanged"],
                    accounts:["eip155:1:0xd6AF81D4b9E9C3fA2044E2FE3b7c052cA312575E","eip155:5:0xd6AF81D4b9E9C3fA2044E2FE3b7c052cA312575E"]
                },
            },
        });
        // ------- end namespaces builder util ------------ //

        const session = await web3wallet.approveSession({
            id,
            namespaces: approvedNamespaces,
        });
        console.log("连接成功，we3wallet:",web3wallet)
    });

    web3wallet.on("session_delete", (eventArgs)=>{
        console.log("断开连接了")
    })

    web3wallet.on('session_request', async event => {
        console.log("event:",event)
        const { topic, params, id } = event
        if(params.request.method === "eth_sendTransaction"){
            const account = web3.eth.accounts.privateKeyToAccount("0x5b0dc78a4a58f97795443ac935851d38dea4ab9ad48e61678f61d58ca71ace7d");
            const {data,from,gas,to,value} = params.request.params[0]
            console.log(data)
            console.log(from)
            console.log(gas)
            console.log(to)
            console.log(value)
            let nonce;
            let gasPrice;
            await web3.eth.getTransactionCount(from).then(non=>{nonce = non});
            await web3.eth.getGasPrice().then((gasP) => {gasPrice = gasP});
            console.log(nonce)
            console.log(gasPrice)
            // 构造交易对象
            const txObject = {
                nonce: nonce,
                gas: gas,
                gasPrice: gasPrice,
                to: to,
                value: value,
                data: data
            };
            const signedTx = await account.signTransaction(txObject);
            const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            console.log("transactionHash:"+receipt.transactionHash)
            const response = { id, result: receipt.transactionHash, jsonrpc: '2.0' }

            await web3wallet.respondSessionRequest({ topic, response })
        }
    })
}

document.querySelector("button").addEventListener("click", submitUri);