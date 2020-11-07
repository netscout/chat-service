import { getValue, setValue, getKeys, delKey } from "./redis-connector";

import { kafkaPublish } from "./kafka-producer";

/**
 * 레디스에서 조회할 키 조합하기
 * @param {string} id 고객의 uuid string
 */
export const getUserKey = (id) => {
  return `online_user:${id}`;
};

/**
 * 요청에 대한 성공 여부 전송
 * @param {object} socket 현재 접속한 socket객체
 * @param {string} reqMessage 요청 메세지 타입
 * @param {object} params 요청 파라미터
 * @param {boolean} succeed 성공 여부
 */
const sendResponse = (socket, reqMessage, params, succeed) => {
  const resData = {
    type: reqMessage,
    params: params,
    succeed: succeed,
  };

  console.log(`message response : ${resData}`);
  socket.emit("response", resData);
};

/**
 * 접속한 소켓의 쿼리 데이터로 사용자 정보 기록 및 초기화
 * @param {object} socket 현재 접속한 socket객체
 * @param {object} next 다음으로 처리할 미들웨어
 */
export const init = async (socket, next) => {
  const id = socket.handshake.query.id;
  const username = socket.handshake.query.username;

  //프론트에서 전달받은 아이디 값 확인
  if (id && username) {
    console.log(
      `id: ${id}, username: ${username}, socket.id: ${socket.id} connected.`
    );

    const connection = {
      socketId: socket.id,
      username: username,
    };

    const key = getUserKey(id);
    let onlineUser;

    //기존에 접속한 사용자 정보 확인
    let data = await getValue(key);

    console.log(data);

    //데이터가 존재한다면 레디스의 데이터를 객체로 변환
    if (data) {
      onlineUser = JSON.parse(data);
    }

    let needToSaveData = false;

    //데이터가 비어있는 경우 새로 추가
    if (!onlineUser) {
      onlineUser = connection;

      needToSaveData = true;
    }
    //데이터는 있지만, 새로 고침등으로 소켓 아이디 변경시
    //소켓 아이디를 갱신
    else if (onlineUser.socketId !== connection.socketId) {
      //기존 소켓 데이터 삭제
      await delKey(onlineUser.socketId);
      onlineUser.socketId = connection.socketId;
      //새로 고침 등으로 소켓 아이디가 달라졌으므로
      //소켓 아이디 - 사용자 아이디 연결을 갱신

      needToSaveData = true;
    }

    if (needToSaveData) {
      //접속 사용자 데이터와 소켓ID-사용자ID 데이터 추가
      await setValue(key, JSON.stringify(onlineUser));
      await setValue(socket.id, id);
    }

    //전체 접속자 수 조회
    let totalConnected = await getKeys(getUserKey("*"));
    if (totalConnected) {
      console.log(`total connected user count : ${totalConnected.length}`);

      const message = {
        type: "event:total_customer_connected",
        value: totalConnected.length,
      };

      kafkaPublish(process.env.KAFKA_TO_ADMIN_TOPIC, JSON.stringify(message));
    }

    sendResponse(socket, "connected", {}, false);

    return next();
  }

  return next(new Error("사용자 아이디가 없음."));
};

/**
 * 소켓에 고객이 새로 접속
 * @param {object} socket 현재 접속한 socket 객체
 */
export const connected = async (socket) => {
  console.log("고객 들어옴.");

  sendResponse(socket, "connected", {}, true);
};

/**
 * 소켓 접속 종료 이벤트 핸들러
 * @param {object} socket 현재 접속한 socket 객체
 */
export const disconnect = async (socket) => {
  socket.on("disconnect", async () => {
    console.log(`disconnect from : ${socket.id}`);
    //소켓ID와 연결된 사용자ID 조회
    let id = await getValue(socket.id);
    console.log(id);
    if (id) {
      await delKey(socket.id);
      await delKey(getUserKey(id));
    }

    //고객이 접속 종료했음을 알리기
    const message = {
      type: "event:customer_disconnected",
      value: id,
    };

    kafkaPublish(process.env.KAFKA_TO_ADMIN_TOPIC, JSON.stringify(message));

    console.log("고객 나감.");
  });
};

/**
 * 상담원에게 채팅 요청 보내기
 * @param {object} socket 현재 접속한 socket 객체
 * @param {object} req 요청 파라미터
 */
export const sendChatRequest = (socket, req) => {
  sendResponse(socket, "chatRequest", req, true);
  socket.join(req.roomId);

  const message = {
    type: "event:customer_chat_request",
    value: req,
  };
  kafkaPublish(process.env.KAFKA_TO_ADMIN_TOPIC, JSON.stringify(message));

  console.log(`상담원에게 채팅 요청 : ${req.subject}`);
};

/**
 * 상담원에게 보낸 채팅 요청 취소하기
 * @param {object} socket 현재 접속한 socket 객체
 * @param {object} req 요청 파라미터
 */
export const cancelChatRequest = (socket, req) => {
  sendResponse(socket, "cancelChatRequest", req, true);
  socket.leave(req.roomId);

  const message = {
    type: "event:customer_cancel_chat_request",
    value: req,
  };
  kafkaPublish(process.env.KAFKA_TO_ADMIN_TOPIC, JSON.stringify(message));

  console.log(`상담원에게 채팅 요청 취소 : ${req.subject}`);
};

/**
 * 채팅 방에서 나가기
 * @param {object} socket 현재 접속한 socket 객체
 * @param {object} req 요청 파라미터
 */
export const exitRoom = (socket, req) => {
  sendResponse(socket, "exitRoom", req, true);
  socket.leave(req.roomId);

  req.message = `${req.username}님이 대화에서 빠졌습니다.`;
  //시스템 메세지로 설정
  req.username = "__system__";

  const message = {
    type: "event:chat_exit",
    value: req,
  };

  kafkaPublish(process.env.KAFKA_TO_ADMIN_TOPIC, JSON.stringify(message));
};

/**
 * 상담원에게 메세지 보내기
 * @param {object} socket 현재 접속한 socket 객체
 * @param {object} req 요청 파라미터
 */
export const sendMessage = (socket, req) => {
  sendResponse(socket, "sendMessage", req, true);

  const message = {
    type: "event:chat_message",
    value: req,
  };

  kafkaPublish(process.env.KAFKA_TO_ADMIN_TOPIC, JSON.stringify(message));
};
