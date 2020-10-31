require("dotenv").config();

import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import socket from "socket.io"

import v1Router from "./routes/v1";

// import { getValue, setValue, getKeys, delKey, setMultiValues } from "./services/redis-connector"

// import { kafkaSubscribe, kafkaDisconnect } from "./services/kafka-consumer"
// import { kafkaPublish } from "./services/kafka-producer"
import { initChatService } from "./services/chat-service";

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//배포될 angular앱 경로 설정
app.use(express.static(`${process.cwd()}/ui/dist/${process.env.UI_APP_NAME}/`))
//app.use(express.static(path.join(__dirname, 'public')));

app.use("/api/v1", v1Router);

//배포될 angular앱 메인 페이지
app.get('/', (req, res) => {
    res.sendFile(`${process.cwd()}/ui/dist/${process.env.UI_APP_NAME}/index.html`)
})

//------------------------socket.io설정----------------------
/**
 * Create socket.io server.
 */
app.io = socket()

initChatService(app.io)

//------------------------에러 처리---------------------------

//404에러 발생시 에러 핸들러에 전송
app.use(function (req, res, next) {    
    next(createError(404));
});

//에러 핸들러
app.use(function (err, req, res, next) {
    let error = err;

    //처리 중에 오류 발생시
    if (!err.status) {
        error = createError(err);
    }

    //개발 환경에서만 에러 표시
    res.locals.message = error.message;
    res.locals.error = process.env.NODE_ENV === "development" ? error : {};

    return res.status(error.status).json({
        message: error.message,
    });
    // return res.status(error.status || 500)
    //     .json(res.locals.error);
});

//---------------------서비스 종료 이벤트 설정------------------------
//각각 정상종료, Ctrl+C 종료, nodemon 재시작
const signalTraps = ["SIGTERM", "SIGINT", "SIGUSR2"];

if (process.platform === "win32") {
  var rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("SIGINT", function () {
    process.emit("SIGINT");
  });
}

signalTraps.map((type) => {
  process.once(type, async () => {
    try {
      await kafkaDisconnect();
    } finally {
      process.kill(process.pid, type);

      console.log("process killed...");
    }
  });
});

module.exports = app;