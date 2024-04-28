const express = require('express');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const app = express();
const fetch = require('node-fetch');

const { euclideanDistance, utils } = require('face-api.js');
const { QUERY_ALL_FACEDATA } = require('./public/js/const/fido-api-constants-cjs')

app.use(express.static(__dirname + '/public'));
app.use(cookieParser());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:58080"); // 设置允许跨域的域名
    next();
});

app.get('/register', function (req, res) {
    res.sendFile(__dirname + '/public/register.html');
});

app.get('/login', function (req, res) {
    res.sendFile(__dirname + '/public/login.html');
});

app.get(['/', '/home'], function (req, res) {
    filterLogin(req, res, '/public/home.html');
});

app.get('/send', function (req, res) {
    filterLogin(req, res, '/public/send.html');
});

app.listen(30000, () => {
    console.log('Server is running on port 30000');
});

function filterLogin(req, res, reachPage){
    const JSESSIONID = req.cookies.JSESSIONID;
    if(JSESSIONID){
        res.sendFile(__dirname + reachPage);
    } else {
        res.redirect('/login');
    }
}

//查看人脸数据是否在数据库中存在
// 处理POST请求，'/api/users'路由
app.post('/frontApi/faceData/checkFace', multer().any(), (req, res) => {
    const JSESSIONID = req.cookies.JSESSIONID;
    console.log("JSESSIONID=",JSESSIONID)
    if(!req.body || !req.body.faceData){
        return res.status(200).send({ code: -1, message: "missing requestParams.", data: null });
    }
    console.log("req.body.faceData:",req.body.faceData)

    fetch(QUERY_ALL_FACEDATA + "?apiKey=wqjmc12ci2dfr9zp",{
        method: "GET",
        headers: {
            'Cookie': `JSESSIONID=${JSESSIONID};`
        }
    })
        .then(response=> response.json())
        .then(({ code, message, data}) => {
            if (code != 1) return res.status(200).send({code, message, data});
            if(data.length === 0) return res.status(200).json({code:0,message:"No match face.",data:null});
            const hasSimilarFace = data.some(faceData => {
                const similarity = Math.round(utils.round(1 - euclideanDistance(faceData.split(","), req.body.faceData.split(","))) * 100);
                console.log("similarity:",similarity)
                return similarity > 58
                // if(similarity > 60){
                //     return res.status(200).send({code:1,message:null,data:null});
                // }
            })
            // 返回响应
            if(!res.headersSent && hasSimilarFace) return res.status(200).send({code:1,message:"Similar face exist",data:null});
            else return res.status(200).send({code:0,message:"No similar face exist",data:null});
        })
        .catch(error => {
            console.log("error:",error)
            return res.status(200).json({code:-1,message:error,data:null})
        });
});
