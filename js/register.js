import * as faceapi from "face-api.js";
import {SERVER} from "./const/fido-api-constants-es6.js";

let registrationElement = document.querySelector('webauthn-registration');

const videoTag = document.getElementById("video");
const canvasElement1 = document.getElementById("canvasElement1");
const canvasElement2 = document.getElementById("canvasElement2");
let ctx1 = canvasElement1.getContext("2d");
let registerUsername;
let faceData;

function show1p1aConfirm(t) {
    t.preventDefault();
    registerUsername = new FormData(t.target).get("username");
    app.confirm1p1a = true;
}

function clickConfirmButton(t){
    app.confirm1p1a = false;
    document.querySelector(".up-supported-by").style.display = "none";
    document.querySelector(".scan-video-container").style.removeProperty("display");
    app.showDetectTips = true;

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

// 加载时触发
window.onload = function (){
    document.querySelector("webauthn-registration").shadowRoot.querySelector("form")
        .addEventListener("submit", show1p1aConfirm);
    document.getElementById("confirm-button").addEventListener("click", clickConfirmButton);
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
            // setTimeout(drawFaceBox, 5000);
            // setTimeout(drawFaceBox, 8000);
        })
        .catch(() => {
            console.error("加载模型错误");
            app.$message({
                message: 'Failed to loading face models.',
                type: 'error'
            });
        })
}

function getVideoErrorHandle(error) {
    console.log("获取摄像头权限失败");
    app.processingFace = false;
    app.$message({
        message: 'Failed to obtain camera permissions.',
        type: 'error'
    });
}

const drawFaceBox = async ()=> {
    const displaySize = faceapi.matchDimensions(canvasElement2, videoTag, true);
    console.log("displaySize:",displaySize)
    // 准备画布，没有这一步方框位置会偏移
    faceapi.matchDimensions(canvasElement2, displaySize);
    const options = new faceapi.TinyFaceDetectorOptions({
        scoreThreshold: 0.5,
        inputSize: 320
    })
    const detections = await faceapi
        .detectAllFaces("video", options);
    console.log("detections:",detections)
    // 调整检测到的盒子和地标的大小，以防显示的图像与原始图像大小不同
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
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
        }else if(resizedDetections[0].box.height < 270){
            app.text = "closer to the camera";
        }else if(resizedDetections[0].box.height > 340){
            app.text = "stay away from the camera";
        }else if(videoTag.offsetWidth-resizedDetections[0].box.x < 120) {
            app.text = "offset to the right";
        }else if(videoTag.offsetWidth-resizedDetections[0].box.x > 320) {
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
    faceData = detection.descriptor.join(",");
    console.log("detection.descriptor:", faceData);
    let formData = new FormData();
    formData.append("faceData",detection.descriptor.join(","));
    fetch(CHECK_FACE,{
        credentials: 'include',
        method: "POST",
        body: formData
    })
        .then(response=> response.json())
        .then(async ({ code, message, data}) => {
            console.log(code,message);
            if (code != 1 && code != 0) {
                app.customAlert("人脸识别出错，请联系管理员。")
            }else if(code == 1){
                app.customAlert("The user has already registered an account!")
            }else if(code == 0){
                await register();
            }
        })
        .catch(error => {
            app.customAlert(error)
            console.error(error)
        })
        .finally(()=>{
            app.showDetectTips = false;
            document.querySelector(".scan-video-container").style.display = "none";
            // 关闭摄像头
            app.videoStatus = false;
            app.videoTrack.stop();
        });

}

async function register(){
    let registrationStartUrl = SERVER + "/api/diyRegister/start", registrationFinishUrl = SERVER + "/api/diyRegister/finish", fetchOptions = {
        method: "POST",
        credentials: "include",
        headers: {"Content-Type": "application/json"}
    }

    try {
        if (!window.PublicKeyCredential){
            alert("Fido is not supported on this browser");
            throw new Error("Web Authentication is not supported on this platform");
        }
        registrationElement.dispatchEvent(new CustomEvent("register-credential-started"));
        const n = await fetch(registrationStartUrl, {
            ...fetchOptions,
            body: JSON.stringify({username: registerUsername, faceData: faceData})
        }), {registrationId: i, publicKeyCredentialCreationOptions: s, message: m1} = await n.json();
        if (!n.ok){
            alert(m1);
            throw new Error("Could not successfuly start register");
        }
        const r = await _getPublicKeyCredentialCreateOptionsDecoder(),
            o = await navigator.credentials.create({publicKey: r(s)});
        registrationElement.dispatchEvent(new CustomEvent("register-credential-retrieved"));
        const a = await _getRegisterCredentialEncoder(), u = await fetch(registrationFinishUrl, {
            ...fetchOptions,
            body: JSON.stringify({registrationId: i, credential: a(o), userAgent: window.navigator.userAgent})
        }), c = await u.json();
        if (!u.ok) {
            alert(c.message);
            throw new Error(c.message || "Could not successfuly complete registration");
        }
        registrationElement.dispatchEvent(new CustomEvent("registration-finished"))
    } catch (t) {
        registrationElement.dispatchEvent(new CustomEvent("registration-error", {detail: {message: t.message}}))
    }
}

async function _getPublicKeyCredentialCreateOptionsDecoder() {
    const {decodePublicKeyCredentialCreateOptions: e} = await import("./utils/parse.js");
    return e;
}

async function _getRegisterCredentialEncoder() {
    const {encodeRegisterCredential: e} = await import("./utils/parse.js");
    return e;
}