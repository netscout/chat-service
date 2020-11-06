import {
    getValue,
    setValue,
    getKeys,
    delKey
  } from "./redis-connector";

import { kafkaPublish } from "./kafka-producer";

/**
 * @param {string} id 고객의 uuid string
 * @description 레디스에서 조회할 키 조합하기
 */
export const getUserKey = (id) => {
  return `online_user:${id}`;
};

/**
 * @param {object} socket 현재 접속한 socket객체
 * @param {object} next 다음으로 처리할 미들웨어
 * @description 접속한 소켓의 쿼리 데이터로 사용자 정보 기록 및 초기화
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

    return next();
  }

  return next(new Error("사용자 아이디가 없음."));
};

/**
 * @param {object} socket 현재 접속한 socket 객체
 * @description 소켓 접속 종료 이벤트 핸들러
 */
export const disconnect = (socket) => {
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

    console.log("유저 나감.");
  });
};

/**
 * @param {object} socket 현재 접속한 socket 객체
 * @description 상담원에게 채팅 요청 보내기
 */
export const sendChatRequest = (socket) => {
  socket.on("chat:request_to_advisor", async (chatReq) => {
    socket.join(chatReq.roomId);

    const message = {
      type: "event:customer_chat_request",
      value: chatReq,
    };
    kafkaPublish(process.env.KAFKA_TO_ADMIN_TOPIC, JSON.stringify(message));

    console.log(`상담원에게 채팅 요청 : ${chatReq.subject}`);
  });
};

/**
 * @param {object} socket 현재 접속한 socket 객체
 * @description 상담원에게 보낸 채팅 요청 취소하기
 */
export const cancelChatRequest = (socket) => {
  socket.on("chat:cancel_request", async (chatReq) => {
    socket.leave(chatReq.roomId);

    const message = {
      type: "event:customer_cancel_chat_request",
      value: chatReq,
    };
    kafkaPublish(process.env.KAFKA_TO_ADMIN_TOPIC, JSON.stringify(message));

    console.log(`상담원에게 채팅 요청 취소 : ${chatReq.subject}`);
  });
};

/**
 * @param {object} socket 현재 접속한 socket 객체
 * @description 채팅 방에서 나가기
 */
export const exitRoom = (socket) => {
  socket.on("chat:exit_room", async (chatMsg) => {
    socket.leave(chatMsg.roomId);

    chatMsg.message = `${chatMsg.username}님이 대화에서 빠졌습니다.`;
    //시스템 메세지로 설정
    chatMsg.username = "__system__";

    const message = {
      type: "event:chat_exit",
      value: chatMsg,
    };

    kafkaPublish(process.env.KAFKA_TO_ADMIN_TOPIC, JSON.stringify(message));
  });
};

/**
 * @param {object} socket 현재 접속한 socket 객체
 * @description 상담원에게 메세지 보내기
 */
export const sendMessage = (socket) => {
  socket.on("chat:new_message", async (chatMsg) => {
    const message = {
      type: "event:chat_message",
      value: chatMsg,
    };

    kafkaPublish(process.env.KAFKA_TO_ADMIN_TOPIC, JSON.stringify(message));
  });
};
