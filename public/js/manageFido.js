import * as faceapi from "face-api.js";
import {euclideanDistance, utils} from "face-api.js";
import { ObtainCameraError, LoadingModelError, FaceRecognizeError } from "./utils/error"

$.ajax({
    url: GET_USER_INFO,
    dataType: 'json',
    type: 'GET',
    xhrFields: {
        withCredentials: true // 设置 withCredentials 选项为 true，允许发送跨站点 Cookie
    },
    success: async function (response) {
        // await processBadResponse(response.code);
        if (response.code != 1) {
            console.error("获取用户信息失败");
            return;
        }
        app.currentFidoId = response.data.fidoPublicKey;
    },
    error: function(xhr, textStatus, errorThrown) {
        console.error('Request failed. Status: ' + xhr.status + ', Text status: ' + textStatus + ', Error thrown: ' + errorThrown);
    }
});

function updateFidoIdList(){
    fetch(GET_CREDENTIALS,{credentials: 'include'})
        .then(response=> response.json())
        .then(({ code: c, message: m, data: d }) => [c, m, d])
        .then(async ([code, message, data]) => {
            await processBadResponse(code);
            if (code != 1) throw new Error(message);
            app.tableData = data.map(item => {
                return {fidoId: item}
            })
        }).catch(error => console.error(error))
}

updateFidoIdList();

async function registerCredential(){
    let registrationStartUrl = SERVER + "/api/credential/register/start", registrationFinishUrl = SERVER + "/api/credential/register/finish", fetchOptions = {
        method: "POST",
        credentials: "include",
        headers: {"Content-Type": "application/json"}
    }

    try {
        if (!window.PublicKeyCredential){
            alert("Fido is not supported on this browser");
            throw new Error("Web Authentication is not supported on this platform");
        }
        window.dispatchEvent(new CustomEvent("register-credential-started"));
        const n = await fetch(registrationStartUrl, {
            ...fetchOptions
        }), {registrationId: i, publicKeyCredentialCreationOptions: s} = await n.json();
        processBadStatus(n)
        if (!n.ok) throw new Error("Could not successfuly start register");
        const r = await _getPublicKeyCredentialCreateOptionsDecoder(),
            o = await navigator.credentials.create({publicKey: r(s)});
        window.dispatchEvent(new CustomEvent("register-credential-retrieved"));
        const a = await _getRegisterCredentialEncoder(), u = await fetch(registrationFinishUrl, {
            ...fetchOptions,
            body: JSON.stringify({registrationId: i, credential: a(o), userAgent: window.navigator.userAgent})
        });
        if (!u.ok) throw new Error("调用接口出错");
        app.showAddConfirm = false;
        updateFidoIdList();
        window.dispatchEvent(new CustomEvent("register-credential-finished"))
    } catch (t) {
        window.dispatchEvent(new CustomEvent("register-credential-error", {detail: {message: t.message}}))
        throw new Error(t.message);
    }
}

document.querySelector(".confirm-add-fido").addEventListener("click", detect1P1A);

async function deleteCredential(){
    const fidoId = app.deleteFidoId;
    let deleteStartUrl = SERVER + "/api/credential/delete/start", deleteFinishUrl = SERVER + "/api/credential/delete/finish", fetchOptions = {
        method: "POST",
        credentials: "include",
        headers: {"Content-Type": "application/json"}
    }
    try {
        if (!window.PublicKeyCredential){
            alert("Fido is not supported on this browser");
            throw new Error("Web Authentication is not supported on this platform");
        }
        window.dispatchEvent(new CustomEvent("delete-credential-started"));
        const n = await fetch(deleteStartUrl, {
            ...fetchOptions,
            body: JSON.stringify({fidoId: fidoId})
        }), {assertionId: i, publicKeyCredentialRequestOptions: s, requestParams: p} = await n.json();
        console.info("teste");
        processBadStatus(n);
        if (!n.ok) throw new Error("Could not successfuly start delete");
        const r = await _getPublicKeyCredentialRequestOptionsDecoder(),
            o = await navigator.credentials.get({publicKey: r(s)});
        window.dispatchEvent(new CustomEvent("delete-retrieved"));
        const a = await _getLoginCredentialEncoder(),
            cre = a(o);
            cre.response.userHandle = s.userHandle;
        const u = await fetch(deleteFinishUrl, {
            ...fetchOptions,
            body: JSON.stringify({assertionId: i, credential: cre})
        });
        if (!u.ok) throw new Error("调用接口出错");
        const {code: c, message:m, data:d} = await u.json();
        processBadResponse(c);
        if (c != 1) {
            throw new Error(m);
        }
        updateFidoIdList();
        app.showDeleteConfirm = false;
        window.dispatchEvent(new CustomEvent("login-finished", {detail: {code: c, message:m, data:d}}))
    } catch (t) {
        window.dispatchEvent(new CustomEvent("login-error", {detail: {message: t.message}}))
        throw new Error(t.message);
    }
}

document.getElementById("delete-confirm-button").addEventListener("click", deleteCredential)

async function _getPublicKeyCredentialCreateOptionsDecoder() {
    const {decodePublicKeyCredentialCreateOptions: e} = await import("./utils/parse.js");
    return e;
}

async function _getRegisterCredentialEncoder() {
    const {encodeRegisterCredential: e} = await import("./utils/parse.js");
    return e;
}

async function _getPublicKeyCredentialRequestOptionsDecoder() {
    const {decodePublicKeyCredentialRequestOptions: e} = await import("./utils/parse.js");
    return e
}

async function _getLoginCredentialEncoder() {
    const {encodeLoginCredential: e} = await import("./utils/parse.js");
    return e
}

const videoTag = document.getElementById("video");
const canvasElement1 = document.getElementById("canvasElement1");
const canvasElement2 = document.getElementById("canvasElement2");
let ctx1 = canvasElement1.getContext("2d");

async function detect1P1A(){
    document.getElementById("scanDiv").style.removeProperty("display")

    canvasElement1.width = videoTag.offsetWidth;
    canvasElement1.height = videoTag.offsetHeight;
    ctx1.scale(-1, 1);
    ctx1.translate(-canvasElement1.width, 0);

    if (navigator.mediaDevices.getUserMedia) {
        // 最新的标准API
        navigator.mediaDevices
            .getUserMedia({video: true,})
            .then(getVideoSuccessHandle)
            .catch(getVideoErrorHandle);
    } else if (navigator.webkitGetUserMedia) {
        // webkit核心浏览器
        //navigator.webkitGetUserMedia(constraints, success, error);
    } else if (navigator.mozGetUserMedia) {
        // firfox浏览器
        //navigator.mozGetUserMedia(constraints, success, error);
    } else if (navigator.getUserMedia) {
        // 旧版API
        //navigator.getUserMedia(constraints, success, error);
    }
}

function getVideoSuccessHandle(stream){
    app.$refs.video.srcObject = stream;
    app.videoTrack = stream.getVideoTracks()[0];
    app.videoStatus = true;
    app.changeLoadingText("loading models...")
    Promise.all([
        faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri('./models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('./models'),
        faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
        faceapi.nets.mtcnn.loadFromUri('./models'),
        faceapi.nets.faceExpressionNet.loadFromUri('./models'),
        faceapi.nets.ageGenderNet.loadFromUri('./models'),
        // faceapi.nets.tinyYolov.loadFromUri('./models')
    ])
        .then(() => {
            console.log("模型加载完成")
            app.processingFace = false;
            app.detectStartTime = Date.now();
            window.requestAnimationFrame(drawFaceBox)
        })
        .catch((error) => {
            if(error instanceof FaceRecognizeError){
                throw error;
            }else{
                app.$message({
                    message: 'Loading face model error',
                    type: 'error',
                });
                console.error(error);
                throw new LoadingModelError();
            }
        })
}

function getVideoErrorHandle(error) {
    if(!(error instanceof FaceRecognizeError) && !(error instanceof LoadingModelError)){
        console.log("获取摄像头权限失败");
        app.$message({
            message: 'Failed to obtain camera permissions.',
            type: 'error',
        });
    }
    app.processingFace = false;
}

const drawFaceBox = async ()=> {
    let displaySize = faceapi.matchDimensions(canvasElement2, videoTag, true);
    console.log("displaySize:",displaySize)
    // 准备画布，没有这一步方框位置会偏移
    faceapi.matchDimensions(canvasElement2, displaySize);
    const options = new faceapi.TinyFaceDetectorOptions({
        scoreThreshold: 0.5,
        inputSize: 320
    })
    const detections = await faceapi
        .detectAllFaces("video", options);
    // console.log("detections:",detections)
    // 调整检测到的盒子和地标的大小，以防显示的图像与原始图像大小不同
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    // console.log("resizedDetections:", resizedDetections)
    let isTerminate = await adjustFace(resizedDetections);
    if(isTerminate) return;
    // 自定义输出边界盒子
    resizedDetections.forEach(result => {
        const { box, _score } = result;
        const customBox = {x:displaySize.width-box.x-box.width, y:box.y, width:box.width, height:box.height};
        drawLabelBox(customBox, {
            label: `可信度${Math.round(_score * 100)}%`
        })
    })
    setTimeout(() => {
        window.requestAnimationFrame(drawFaceBox);
    })
}

function drawLabelBox(box, options) {
    console.log("videoTag.offsetWidth:",videoTag.offsetWidth)
    console.log("box",box)
    // 绘制框 + 绘制文本
    const _box = { x: 50, y: 50, width: 100, height: 100 }
    const drawOptions = {
        label: 'Hello I am a box!', // 框的描述文字，只能整单行文字
        lineWidth: 2,               // 边框宽度
        boxColor: 'red',            // 边框颜色，默认蓝色
        drawLabelOptions: {
            anchorPosition: 'TOP_LEFT',            // [TOP_LEFT | TOP_RIGHT | BOTTOM_LEFT | BOTTOM_RIGHT]
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // label文字块的背景颜色
            fontColor: 'purple',                   // label文字颜色
            fontSize:  16,                         // label文字大小
            padding: 15                            // label文字的padding
        }
    }
    const drawAreaBox = new faceapi.draw.DrawBox(box || _box, options || drawOptions);
    drawAreaBox.draw(canvasElement2);
}

async function adjustFace(resizedDetections) {
    const nowTime = Date.now();

    //隔1.5s 更新一次提示
    if (nowTime - app.detectStartTime > 1500) {
        app.rightPosition = false;
        if (resizedDetections.length === 0) {
            app.text = "no face detected";
        }else if (resizedDetections.length > 1) {
            app.text = "more than 1 face detected";
        }else if(resizedDetections[0].box.height < 285){
            app.text = "closer to the camera";
        }else if(resizedDetections[0].box.height > 330){
            app.text = "stay away from the camera";
        }else if(videoTag.offsetWidth-resizedDetections[0].box.x < 100) {
            app.text = "offset to the right";
        }else if(videoTag.offsetWidth-resizedDetections[0].box.x > 310) {
            app.text = "offset to the left";
        }else{
            app.text = "keep your face"
            app.rightPosition = true;
        }
        if(!app.rightPosition){
            app.detectStartTime = nowTime;
        }
    }
    if(app.rightPosition && nowTime - app.detectStartTime > 3000){
        await checkVideoFrame();
        return 1
    }
}

async function checkVideoFrame() {
    console.log("检测是否存在人脸");
    ctx1.drawImage(videoTag, 0, 0, canvasElement1.width, canvasElement1.height);
    canvasElement1.style.removeProperty('display');
    app.text = "processing face..."
    app.changeLoadingText("")
    app.processingFace = true
    const detection = await faceapi.detectSingleFace('canvasElement1').withFaceLandmarks().withFaceDescriptor();
    const faceData = detection.descriptor.join(",");
    console.log("detection.descriptor:", faceData);
    // let formData = new FormData();
    // formData.append("faceData",detection.descriptor.join(","));
    fetch(QUERY_LOGIN_USER_FACE,{
        credentials: 'include',
        method: "POST",
    })
        .then(response=> response.json())
        .then(async ({ code, message, data}) => {
            console.log(code,message);
            await processBadResponse(code);
            if(code == 1){
                const similarity = Math.round(utils.round(1 - euclideanDistance(faceData.split(","), data.split(","))) * 100);
                console.log("similarity:", similarity)
                if (similarity > 60) {
                    await registerCredential();
                }else{
                    app.customAlert("Face don't match.")
                }
            }else if(code == 0){
                app.customAlert("You have not imported your face data yet")
            }else if(code == -1){
                app.customAlert(message)
                throw new Error(message);
            }
        })
        .catch(error => {
            app.customAlert(error)
            console.error(error)
            throw new FaceRecognizeError();
        })
        .finally(()=>{
            document.getElementById("scanDiv").style.display = "none";
            // 关闭摄像头
            app.videoStatus = false;
            app.videoTrack ? app.videoTrack.stop() : null;
        });

}