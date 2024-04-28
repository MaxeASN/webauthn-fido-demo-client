//createTransferButton
let ethCoin = document.querySelector("#pane-token > div:nth-child(1)");
let usdtCoin = document.querySelector("#pane-token > div:nth-child(2)");
let usdcCoin = document.querySelector("#pane-token > div:nth-child(3)")
ethCoin.addEventListener('click', event => {
    if (!event.target.closest('button.up-button')){
        let targetNode = ethCoin.querySelector(".bottom");
        if(targetNode === null){
            const newDiv = document.createElement("div");
            newDiv.classList.add("bottom");
            newDiv.innerHTML = `
        <button class="el-button el-button--primary up-button" aria-disabled="false" type="button" onclick="window.location.href='/send?symbol=ETH&chain=eth'"><!--v-if-->
            <span class="">SEND</span>
        </button>
    `;
            ethCoin.appendChild(newDiv)
        }else{
            ethCoin.removeChild(targetNode);
        }
    }

})

usdtCoin.addEventListener('click', event => {
    if (!event.target.closest('button.up-button')){
        let targetNode = usdtCoin.querySelector(".bottom");
        if(targetNode === null){
            const newDiv = document.createElement("div");
            newDiv.classList.add("bottom");
            newDiv.innerHTML = `
            <button class="el-button el-button--primary up-button" aria-disabled="false" type="button" onclick="window.location.href='/send?symbol=USDT&chain=eth'"><!--v-if-->
                <span class="">SEND</span>
            </button>
        `;
            usdtCoin.appendChild(newDiv)
        }else{
            usdtCoin.removeChild(targetNode);
        }
    }
})
usdcCoin.addEventListener('click', event => {
    if (!event.target.closest('button.up-button')){
        let targetNode = usdcCoin.querySelector(".bottom");
        if(targetNode === null){
            const newDiv = document.createElement("div");
            newDiv.classList.add("bottom");
            newDiv.innerHTML = `
            <button class="el-button el-button--primary up-button" aria-disabled="false" type="button" onclick="window.location.href='/send?symbol=USDC&chain=eth'"><!--v-if-->
                <span class="">SEND</span>
            </button>
        `;
            usdcCoin.appendChild(newDiv)
        }else{
            usdcCoin.removeChild(targetNode);
        }
    }
})

//convertTab
let tokenTab = document.getElementById("tab-token");
let transactionRecordTab = document.getElementById("tab-collection");
let activeBar = document.querySelector('.el-tabs__active-bar.is-top');
let tokenPane = document.getElementById("pane-token");
let transactionRecordPane = document.getElementById("pane-collection");
let intervalId;
transactionRecordTab.addEventListener('click', function (){
    tokenTab.className = "el-tabs__item is-top";
    transactionRecordTab.classList.add("is-active");
    activeBar.style.width = '70px';
    activeBar.style.transform = 'translateX(132px)';
    transactionRecordPane.setAttribute("aria-hidden", "false");
    transactionRecordPane.setAttribute("style", "overflow-y: auto; height: 300px;");
    tokenPane.setAttribute("aria-hidden", "true");
    tokenPane.setAttribute("style", "display: none; ");
    displayTransactionHistory();
    // 设置定时事件，并保存ID
    intervalId = setInterval(() => {
        displayTransactionHistory();
    }, 10000);
})

tokenTab.addEventListener('click', function (){
    transactionRecordTab.className = "el-tabs__item is-top";
    tokenTab.classList.add("is-active");
    activeBar.style.width = '70px';
    activeBar.style.transform = 'translateX(0px)';
    tokenPane.setAttribute("aria-hidden", "false");
    tokenPane.setAttribute("style", "");
    transactionRecordPane.setAttribute("aria-hidden", "true");
    transactionRecordPane.setAttribute("style", "display: none;");
    // 取消查询交易的定时事件
    clearInterval(intervalId);
})

//displayBalance
let address;
let username;
let web3_l1 = web3_goerli_eth;
$.ajax({
    url: GET_USER_INFO,
    dataType: 'json',
    type: 'GET',
    xhrFields: {
        withCredentials: true // 设置 withCredentials 选项为 true，允许发送跨站点 Cookie
    },
    success: async function (response) {
        await processBadResponse(response.code);
        if (response.code != 1) {
            console.error("获取用户信息失败");
            return;
        }
        $("#display-username").text(response.data.username);
        $("#nickname").text(response.data.username);
        $("#display-address > span").text(response.data.address);
        $("#fidoid").text(response.data.fidoPublicKey);
        address = response.data.address;
        username = response.data.username;
        localStorage.setItem("username", username)
        localStorage.setItem(username + "_contract_address", response.data.contractAddress)
        displaySelectAddress();
        setSchedule();
        displayFidoPbKey();
    },
    error: function(xhr, textStatus, errorThrown) {
        console.error('Request failed. Status: ' + xhr.status + ', Text status: ' + textStatus + ', Error thrown: ' + errorThrown);
    }
});

async function displaySelectAddress(){
    if(address && username){
        let displayAddress;
        if(localStorage.getItem
(username+"_select_address")){
            displayAddress = localStorage.getItem
(username+"_select_address");
        }else{
            displayAddress = address;
            localStorage.setItem(username+"_select_address", address)
        }
        displayAddress = displayAddress.substring(0, 6) + '...' + displayAddress.substring(37);
        document.querySelector("#display-address > span").innerText = displayAddress;
    }
}

async function setSchedule(){
    if(address){
        getAndUpdateLayer2Balance();
        setInterval(() => {
            getAndUpdateLayer2Balance();
        }, 10000); //10秒刷新一次余额

    }

    if(address && username){
        getAndUpdateLayer1Balance();
        setInterval(() => {
            getAndUpdateLayer1Balance();
        }, 10000); //10秒刷新一次余额
    }

}

async function getAndUpdateLayer1Balance() {
    let selectAddress = localStorage.getItem
(username+"_select_address") || address;
    web3_l1.eth.getBalance(selectAddress, (err, balance) => {
        if (err) {
            console.error(err);
            return;
        }
        balance = web3.utils.fromWei(balance, 'ether');
        updateLayer1EthBalance(balance);
    });
}

function updateLayer1EthBalance(balance) {
    let result = formatBalance(balance);
    let ethAmount = document.querySelector("#token-box-balance-eth > div:nth-child(2)");
    ethAmount.innerText = result;
}

async function getAndUpdateLayer2Balance(){
    web3.eth.getBalance(address, (err, balance) => {
        if (err) {
            console.error(err);
            return;
        }
        balance = web3.utils.fromWei(balance, 'ether');
        updateLayer2EthBalance(balance);
    });
}

function updateLayer2EthBalance(balance){
    let result = formatBalance(balance);
    let ethAmount = document.getElementById("mainCoin_amount");
    ethAmount.innerText = result;
}

//displayTransactionHistory
function displayTransactionHistory(){
    fetch(GET_TRANSACTION_HISTORY,{credentials: 'include'})
        .then(response=> response.json())
        .then(({ code: c, message: m, data: d }) => [c, m, d])
        .then(async ([code, message, data]) => {
            await processBadResponse(code);
            if (code != 1) throw new Error(message);
            const transactionList = data.list;
            if (transactionList.length > 0) {
                let transactionHtml = "";
                for (let i = 0; i < transactionList.length; i++) {
                    let transactionId = transactionList[i].id;
                    let dateStr = formatDate(transactionList[i].createTime);
                    let amount = transactionList[i].amount;
                    let chainId = transactionList[i].chainId;
                    let displayAddress = transactionList[i].toAddress.substring(0, 6) + '...' + transactionList[i].toAddress.substring(37);
                    transactionHtml = transactionHtml + `<div class="coin" onclick="displayTransactionDetails(event)"><div class="transaction-id" style="display: none">${transactionId}</div><div class="top"><div class="up-token index"><div class="token-box"><svg width="36" height="36" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="0.5" y="0.5" width="29" height="29" rx="14.5" stroke="#0376c9"></rect><path d="M18.5851 9.88921C18.5586 9.89005 18.5321 9.89238 18.5057 9.89618H14.3207C14.0635 9.89254 13.8243 10.0276 13.6947 10.2497C13.565 10.4719 13.565 10.7466 13.6947 10.9687C13.8243 11.1908 14.0635 11.3259 14.3207 11.3222H16.8777L9.53811 18.6614C9.35182 18.8402 9.27679 19.1058 9.34193 19.3557C9.40707 19.6056 9.60222 19.8007 9.85211 19.8658C10.102 19.931 10.3676 19.8559 10.5464 19.6697L17.886 12.3305V14.8874C17.8823 15.1445 18.0175 15.3837 18.2396 15.5133C18.4617 15.643 18.7364 15.643 18.9585 15.5133C19.1806 15.3837 19.3158 15.1445 19.3121 14.8874V10.6997C19.3409 10.4919 19.2767 10.282 19.1366 10.1259C18.9965 9.96973 18.7948 9.88316 18.5851 9.88921Z" fill="#0376c9"></path></svg></div><div class="index"><div class="index-title">发送</div><div class="index-subtitle"><span style="color:#28a745;">${dateStr}</span>
                                                        至：${displayAddress}</div></div></div><div class="balance"><iconpark-icon icon-id="loading" class="iconpark icon-loading is-loading duration" style="display: none;" name="" size="1em" width="" height=""></iconpark-icon><div>-${amount} ETH</div><div class="up-dollar" symbol="ETH">chain ${chainId}</div></div></div></div>`;
                }
                let nftNoneDiv = document.querySelector(".nft-none");
                nftNoneDiv.setAttribute("style", "display: none;");
                let paneCollectionDiv = document.getElementById("pane-collection")
                paneCollectionDiv.querySelectorAll(".coin").forEach(node => paneCollectionDiv.removeChild(node));
                nftNoneDiv.insertAdjacentHTML('afterend', transactionHtml);
            }
        })
        .catch(error => console.error(error));
}

function displayTransactionDetails(event){
    let transactionId = parseInt(event.currentTarget.querySelector(".transaction-id").textContent);
    fetch(GET_ONE_TRANSACTION + `?transactionId=${transactionId}`,{credentials: 'include'})
        .then(response=> response.json())
        .then(({ code: c, message: m, data: d }) => [c, m, d])
        .then(async ([code, message, data]) => {
            await processBadResponse(code);
            if (code != 1) throw new Error(message);
            app.tdL1Hash = app.tdState = "";
            app.loadingState = app.loadingL1Hash = true;
            app.tdChain = data.chain;
            app.tdFrom = data.from;
            app.tdTo = data.to;
            app.tdAmount = data.amount;
            app.tdSymbol = data.symbol;
            app.tdL2Hash = data.l2Hash;
            $(".transaction-details").show();
            const receipt = await web3.eth.getTransactionReceipt(data.l2Hash);
            if (!receipt) {
                app.loadingState = app.loadingL1Hash = false;
                app.tdState = "null";
                app.tdL1Hash = "null";
                return;
            }
            const seqNum = receipt.logs[2].topics[3];

            let contractAddress = localStorage.getItem(username + "_contract_address");
            const contract = new web3.eth.Contract(simpleAccountAbi, contractAddress);
            const transactionInfo = await contract.methods.TxsInfo(data.from, seqNum).call();
            app.loadingState = app.loadingL1Hash = false;
            app.tdState = parseTransactionState(transactionInfo.state);
            app.tdL1Hash = (transactionInfo.l1TxHash !== null && transactionInfo.l1TxHash.length === 66) ? transactionInfo.l1TxHash : null;
        }).catch(error => console.error(error))
}

function formatDate(dateString) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const date = new Date(dateString);
    const month = months[date.getMonth()];
    const day = date.getDate();

    return `${month} ${day} ·`;
}

//获取用户地址列表并显示
let addressOptionDiv = document.querySelector(".chain-select-container.address-options");
async function displayL1Address() {
    if (addressOptionDiv.style.display === "none") {
        await updateL1Address();
        //取消显示主网选择
        let setIcon = document.querySelector(".setting-icons");
        if (setIcon.getAttribute("data-display") === "true") {
            await showCoinMenu();
        }

        document.querySelector(".up-home-page-header").classList.add("up-home-page-header-bg");
        addressOptionDiv.style.display = "";
        document.getElementById("cover-address-select").style.display = "";
    }else{
        document.querySelector(".up-home-page-header").classList.remove("up-home-page-header-bg");
        addressOptionDiv.style.display = "none"
        document.getElementById("cover-address-select").style.display = "none";
    }
}

async function updateL1Address(){
    if(username === "" || address==="") return;
    let selectAddress = localStorage.getItem
(username+"_select_address") || address;
    await fetch(GET_L1ADDRESS,{credentials: 'include'})
        .then(response => response.json())
        .then(({code: c, message: m, data: d}) => [c, m, d])
        .then(async ([code, message, data]) => {
            await processBadResponse(code);
            if (code != 1) throw new Error(message);
            if (data.length > 0) {
                // 获取父元素和按钮元素
                let parentDiv = document.querySelector(".chain-select-options.chain-options");
                let buttonDiv = parentDiv.querySelector(".button-box.button-box-padding");
                let previousAddressList = parentDiv.querySelectorAll(".option");
                for (let i = 0; i < previousAddressList.length; i++) {
                    parentDiv.removeChild(previousAddressList[i]);
                }
                for (let i = 0; i < data.length; i++) {
                    let optionDiv = document.createElement("div");
                    optionDiv.className = "option";
                    let labelDiv = document.createElement("div")
                    labelDiv.className = "label";
                    labelDiv.innerText = data[i];
                    optionDiv.appendChild(labelDiv);
                    optionDiv.addEventListener("click", updateDisplayAddress);
                    if (data[i] === selectAddress) {
                        labelDiv.insertAdjacentHTML("afterend", `<iconpark-icon icon-id="round-select" class="iconpark icon-round-select round-select" name="" size="1em" width="" height=""></iconpark-icon>`);
                    } else {
                        labelDiv.insertAdjacentHTML("afterend", `<img src="img/delete.svg" style="margin-left: auto">`);
                    }
                    parentDiv.insertBefore(optionDiv, buttonDiv);
                }
            }
        })
        .catch(error => console.error("查询l1地址失败:" + error));
}

function updateDisplayAddress(event) {
    const selectAddress = event.currentTarget.querySelector(".label").innerText;
    localStorage.setItem(username + "_select_address", selectAddress);
    displayL1Address();
    displaySelectAddress();
    getAndUpdateLayer1Balance();
}

function displayCreateAddressConfirm(){
    let confirmDiv = document.getElementById("create-address-confirm");
    confirmDiv.style.display = "";
}

function hideCreateAddressConfirm(){
    let confirmDiv = document.getElementById("create-address-confirm");
    confirmDiv.style.display = "none";
}

function createL1Address(){
    fetch(ADD_L1ADDRESS,{credentials: 'include'})
        .then(response=> response.json())
        .then(({ code: c, message: m, data: d }) => [c, m, d])
        .then(async ([code, message, data]) => {
            await processBadResponse(code);
            if (code != 1) {
                alert(message);
                throw new Error(message);
            }
            alert("创建成功");
            hideCreateAddressConfirm();
            updateL1Address();
        })
        .catch(error => console.error(error));

}

function closeTransactionDetails(){
    let transactionOverlay = document.querySelector(".el-overlay.transaction-details");
    transactionOverlay.style.display = "none";
}

async function displayFidoPbKey() {
    let displayFidoPbKey = $("#fidoid").text();
    if (displayFidoPbKey.length > 30){
        displayFidoPbKey = displayFidoPbKey.substring(0, 16) + "......" + displayFidoPbKey.substring(displayFidoPbKey.length - 15);
    }
    document.getElementById("fidoid").innerText = displayFidoPbKey;
}

function openScan(){
    $("#scanDiv").css("display", "");
}

function closeScan(){
    $("#scanDiv").css("display", "none");
}

function addDappConfirm(){
    let confirmHtml = `<div class="el-overlay" id="addDapp-confirm" style="z-index: 2012; ">
                <div role="dialog" aria-modal="true" aria-labelledby="el-id-3005-6" aria-describedby="el-id-3005-7" class="el-overlay-dialog">
                    <div class="el-dialog el-dialog--center drawer-receive-dialog" tabindex="-1" style="background-color: rgb(62 56 106);border: 1px solid #575e96;">
                        <div id="el-id-3005-7" class="el-dialog__body">
                            <div>
                                <div id="receive-dialog" data-v-7bb2b20a="" style="align-items: flex-start;">
                                    <div class="title" id="title-confirm" data-v-7bb2b20a="" style="display: flex; justify-content: center; align-self: center;">
                                        <span data-v-7bb2b20a="" style="font-weight: bolder;font-size: 20px;color: white;">Add Dapp</span>
                                    </div>
                                    <div class="dapp-url-text" style="font-weight: bolder;margin-top: 20px;margin-bottom: -10px;color: white">URL</div>
                                    <input class="dapp-url" autofocus="" data-v-7bb2b20a="" style="margin-top: 20px;background: #f9f9f9;border-radius: 12px;padding: 10px 10px;font-size: 14px;font-weight: 400;color: #1f202a;line-height: 26px;width: 100%;">
                                    <div class="dapp-name-text" style="font-weight: bolder;margin-top: 15px;margin-bottom: -10px;color: white">Name</div>
                                    <input class="dapp-name" data-v-7bb2b20a="" style="margin-top: 20px;background: #f9f9f9;border-radius: 12px;padding: 10px 10px;font-size: 14px;font-weight: 400;color: #1f202a;line-height: 26px;width: 100%;">
                                    <div class="icon-url-text" style="font-weight: bolder;margin-top: 15px;margin-bottom: -10px;color: white">Icon URL</div>
                                    <div class="icon-input" style="display: flex;justify-content: space-between;">
                                        <div>
                                            <input class="icon-url" oninput="checkDappIcon(event)" data-v-7bb2b20a="" style="margin-top: 20px;background: #f9f9f9;border-radius: 12px;padding: 10px 10px;font-size: 14px;font-weight: 400;color: #1f202a;line-height: 26px;width: 90%">
                                        </div>
                                        <div class="AddCustomDappModal_iconWrapper__15HS7"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="40" width="40" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"></path></svg></div>
                                    </div>
                                    <div id="confirm-button" style="margin-top: 10px;margin-left: 10px;">
                                        <button class="el-button el-button--primary copy up-button copy" id="confirm-button-yes" aria-disabled="false" type="button" data-v-7bb2b20a="" onclick="confirmAddDapp()" style="
                cursor: pointer;
                width: 30%;
                height: 46px;
                margin-right: 60px;
                margin-left: 20px;
                font-size: 15px;
                font-weight: 600;
                border-radius: 12px;
                border: none;
                background: linear-gradient(320deg, #8864ff 0, #9a7cff 100%);
                box-shadow: inset 1px 1px 4px 0 hsla(0, 0%, 100%, 0.5)">
                                            <span class="" style="color: white;">Confirm</span>
                                        </button>
                                        <button class="el-button el-button--primary copy up-button copy el-button-cancel" id="confirm-button-cancel" aria-disabled="false" type="button" data-v-7bb2b20a="" onclick="cancelAddDappConfirm()" style="
                width: 30%;
                height:46px;
                background: linear-gradient(320deg, #bdb8d1 0, #bdb8d1 100%);
                cursor: pointer;
                font-size: 15px;
                font-weight: 600;
                border-radius: 12px;
                border: none;
                box-shadow: inset 1px 1px 4px 0 hsla(0, 0%, 100%, 0.5)">
                                            <span class="" style="color: white;">Cancel</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!--v-if-->
                    </div>
                </div>
            </div>`;
    $(".up-app").append(confirmHtml);
}

function cancelAddDappConfirm(){
    $("#addDapp-confirm").remove();
}

function checkDappIcon(event) {
    let imgUrl = event.target.value;
    let img = new Image();
    img.onload = function() {
        let imgHtml = `<img width="46" height="46" src="${imgUrl}" alt="no logo">`
        $(".AddCustomDappModal_iconWrapper__15HS7").html(imgHtml);
        $(".icon-error").remove();
    };
    img.onerror = function() {
        let imgHtml = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="40" width="40" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"></path></svg>`
        $(".AddCustomDappModal_iconWrapper__15HS7").html(imgHtml);
        $(".icon-error").remove();
        $(".icon-input").after(`<div class="error addDapp-error icon-error"><iconpark-icon icon-id="wrong" class="iconpark icon-wrong" name="" size="1em" width="" height=""></iconpark-icon>Invalid icon URL</div>`);
    };
    img.src = imgUrl;
}

function confirmAddDapp(){
    // let errorDiv = $(".addDapp-error").first();
    // if(errorDiv) return;
    $(".dapp-icon.uniswap").show();
    cancelAddDappConfirm();
}