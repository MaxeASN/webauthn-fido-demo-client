const checkInput = {}
let ethAddressInput = document.querySelector("#el-id-2950-8");
let amountInput = document.querySelector("#el-id-2950-7");
let amountDiv = document.getElementById("amount-input");


const ethAddressRegex = /^(0x)?[a-fA-F0-9]{40}$/;

async function displayBalance(){
    let web3_url;
    let username = localStorage.getItem
("username");
    let selectAddress = localStorage.getItem
(username+"_select_address");
    if(!selectAddress){
        return;
    }
    if(chain === "eth"){
        web3_url = web3_goerli_eth;
        web3_url.eth.getBalance(selectAddress, (err, balance) => {
            if (err) {
                console.error(err);
                return;
            }
            balance = web3.utils.fromWei(balance, 'ether');
            balance = formatBalance(balance);
            updateSendPageBalance(balance);
        });
    }else{
        return;
    }
}

function updateSendPageBalance(balance){
    $('#balance_amount').text(balance);
}

displayBalance();

function checkEthAddress() {
    const inputVal = ethAddressInput.value;
    let addressDiv = document.getElementById("address-input");
    let errorNode = addressDiv.querySelector(".error");

    if (!ethAddressRegex.test(inputVal)) {
        if(errorNode !== null){
            addressDiv.removeChild(errorNode);
        }
        const errorDiv = document.createElement("div");
        errorDiv.className = "error";
        errorDiv.innerHTML = `<iconpark-icon icon-id="wrong" class="iconpark icon-wrong" name="" size="1em" width="" height=""></iconpark-icon>无效地址`
        addressDiv.appendChild(errorDiv);
    } else {
        if(errorNode !== null){
            addressDiv.removeChild(errorNode);
        }
    }
}

function checkAmount(){
    let inputVal = amountInput.value;
    // 去除非数字字符，并保留第一个小数点
    inputVal = inputVal.replace(/[^\d.]/g, '');
    const firstDotIndex = inputVal.indexOf('.');
    if (firstDotIndex !== -1) {
        inputVal = inputVal.slice(0, firstDotIndex + 1) + inputVal.slice(firstDotIndex + 1).replace(/\./g, '');
    }

    // 如果以小数点开头，则在前面添加 0
    if (inputVal.startsWith('.')) {
        inputVal = '0' + inputVal;
    }

    // 更新输入框的值
    amountInput.value = inputVal;
    if(inputVal < 0.0001){
        createErrorDiv(amountDiv, "转账金额不能小于0.0001")
    }else if(inputVal > $('#balance_amount').text()){
        createErrorDiv(amountDiv, "余额不足")
    }else{
        removeErrorDiv(amountDiv)
    }
}

function createErrorDiv(div, errorMsg){
    let errorNode = div.querySelector(".error");
    if(errorNode !== null){
        div.removeChild(errorNode);
    }

    const errorDiv = document.createElement("div");
    errorDiv.className = "error";
    errorDiv.innerHTML = `<iconpark-icon icon-id="wrong" class="iconpark icon-wrong" name="" size="1em" width="" height=""></iconpark-icon>${errorMsg}`
    div.appendChild(errorDiv);
}

function removeErrorDiv(div){
    let errorNode = div.querySelector(".error");
    if(errorNode !== null){
        div.removeChild(errorNode);
    }
}

document.querySelector("#el-id-2950-8").addEventListener('input', checkEthAddress);
document.querySelector("#el-id-2950-7").addEventListener('input', checkAmount);