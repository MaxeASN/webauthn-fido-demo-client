class ObtainCameraError extends Error {
    constructor() {
        super("获取摄像头失败");
        this.name = 'ObtainCameraError';
    }
}

class LoadingModelError extends Error {
    constructor() {
        super("加载人脸模型失败");
        this.name = 'LoadingModelError';
    }
}

class FaceRecognizeError extends Error {
    constructor() {
        super("人脸识别失败");
        this.name = 'FaceRecognizeError';
    }
}

export {ObtainCameraError, LoadingModelError, FaceRecognizeError}