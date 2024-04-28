import * as faceapi from 'face-api.js';

const loading = app.$loading({
    lock: true,
    text: 'Loading Camera...',
    background: 'rgba(0, 0, 0, 0.75)'
});

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

function getVideoSuccessHandle(stream){
    app.$refs.video.srcObject = stream;
    app.videoStatus = true;
    loading.text = "Loading Models..."
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
            loading.close()
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
    loading.close();
    app.$message({
        message: 'Failed to obtain camera permissions.',
        type: 'error'
    });
}


const videoTag = document.getElementById("video");
const canvasElement1 = document.getElementById("canvasElement1");
const canvasElement2 = document.getElementById("canvasElement2");
canvasElement1.width = videoTag.offsetWidth;
canvasElement1.height = videoTag.offsetHeight;
let ctx1 = canvasElement1.getContext("2d");
ctx1.scale(-1, 1);
ctx1.translate(-canvasElement1.width, 0);
const drawFaceBox = async ()=> {
    const displaySize = faceapi.matchDimensions(canvasElement2, videoTag, true);
    // console.log("displaySize:",displaySize)
    // 准备画布，没有这一步方框位置会偏移
    faceapi.matchDimensions(canvasElement2, displaySize);
    const options = new faceapi.TinyFaceDetectorOptions({
        scoreThreshold: 0.5,
        inputSize: 320
    })
    const detections = await faceapi
        .detectAllFaces("video", options);
    // 调整检测到的盒子和地标的大小，以防显示的图像与原始图像大小不同
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
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

async function importVideoFrame(){
    console.log("点击按钮");
    console.log(app.videoStatus);
    if(app.videoStatus){
        ctx1.drawImage(videoTag, 0, 0, canvasElement1.width, canvasElement1.height);
        canvasElement1.style.removeProperty('display');
        app.processingFace = true
        const detection = await faceapi.detectSingleFace('canvasElement1').withFaceLandmarks().withFaceDescriptor();
        console.log("detection.descriptor.length:",detection.descriptor.length)
        console.log("detection.descriptor:",detection.descriptor.join(","));
        let formData = new FormData();
        formData.append("faceData",detection.descriptor.join(","));
        fetch(IMPORT_FACE,{
            credentials: 'include',
            method: "POST",
            body: formData
        })
            .then(response=> response.json())
            .then(async ({ code, message, data}) => {
                console.log(code,message);
                await processBadResponse(code);
                if (code != 1) throw new Error(message);
                app.$message({
                    message: "import success!",
                    type: 'success',
                    center: true,
                    customClass: "up-message-success",
                    duration: 2000
                });
                app.processingFace = false;
                canvasElement1.style.display = 'none';
            })
            .catch(error => console.error(error));
    }
}

document.getElementById("importButton").addEventListener("click", importVideoFrame);

async function checkVideoFrame() {
    console.log("点击按钮");
    ctx1.drawImage(videoTag, 0, 0, canvasElement1.width, canvasElement1.height);
    canvasElement1.style.removeProperty('display');
    app.processingFace = true
    const detection = await faceapi.detectSingleFace('canvasElement1').withFaceLandmarks().withFaceDescriptor();
    console.log("detection.descriptor:",detection.descriptor.join(","));
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
            await processBadResponse(code);
            if(code == 0){
                app.$alert('No similar faces exist.', '', {
                    confirmButtonText: 'confirm',
                });
            }
            if (code != 1) throw new Error(message);
            app.$alert('Exist similar faces.', '', {
                confirmButtonText: 'confirm',
            });
            app.processingFace = false;
            canvasElement1.style.display = 'none';
        })
        .catch(error => console.error(error));

}

document.getElementById("checkButton").addEventListener("click", checkVideoFrame);