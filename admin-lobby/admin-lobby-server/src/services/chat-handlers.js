import { getValue, setValue, getKeys, delKey } from "./redis-connector";

import { kafkaPublish } from "./kafka-producer";

/**
 * @param {string} id 상담원의 uuid string
 * @description 레디스에서 조회할 키 조합하기
 */
const getAdvisorKey = (id) => {
  return `online_advisor:${id}`;
};

/**
 * @description 레디스에 현재 접속중인 상담원 목록 조회
 */
const getConnectedAdvisorList = async () => {
  const connectedKeys = await getKeys("online_advisor:*");
  console.log(connectedKeys);
  let connectedList = [];
  if (connectedKeys) {
    for (let key of connectedKeys) {
      let connected = JSON.parse(await getValue(key));

      if ("socketId" in connected) {
        delete connected.socketId;
      }

      connectedList.push(connected);
    }
  }

  return connectedList;
};

/**
 * @description 레디스에 현재 접속 중인 고객 수 조회
 */
const getConnectedCustomerList = async () => {
  //전체 접속자 수 조회
  let totalConnected = await getKeys("online_user:*");

  return !!totalConnected ? totalConnected.length : 0;
};

/**
 * @param {string} socketId 상담원의 socketId
 * @description 레디스에서 현재 접속중인 소켓의 상담원 정보 조회
 */
const getCurrentAdvisor = async (socketId) => {
  const id = await getValue(socketId);
  const onlineAdvisor = await getValue(getAdvisorKey(id));

  if (onlineAdvisor.hasOwnProperty("socketId")) {
    delete onlineAdvisor.socketId;
  }

  return onlineAdvisor;
};

const sendResponse = (socket, reqMessage, params, succeed) => {
  const resData = {
    type: reqMessage,
    params: params,
    succeed: succeed
  };

  console.log(`message response : ${resData}`);
  socket.emit("response", resData);
}

/**
 * @param {object} socket 현재 접속한 socket객체
 * @param {object} next 다음으로 처리할 미들웨어
 * @description 접속한 소켓의 쿼리 데이터로 사용자 정보 기록 및 초기화
 */
export const init = async (socket, next) => {
  const id = socket.handshake.query.id;
  const username = socket.handshake.query.username;
  const role = +socket.handshake.query.role;

  //프론트에서 전달받은 아이디 값 확인
  if (id && username) {
    console.log(
      `id: ${id}, username: ${username}, socket.id: ${socket.id} connected.`
    );

    const connection = {
      id: id,
      socketId: socket.id,
      username: username,
      status: 0,
      role: role,
    };

    const key = `online_advisor:${id}`;
    let onlineAdvisor;

    //기존에 접속한 사용자 정보 확인
    let data = await getValue(key);

    console.log(data);

    //데이터가 존재한다면 레디스의 데이터를 객체로 변환
    if (data) {
      onlineAdvisor = JSON.parse(data);
    }

    let needToSaveData = false;

    //데이터가 비어있는 경우 새로 추가
    if (!onlineAdvisor) {
      onlineAdvisor = connection;

      needToSaveData = true;
    }
    //데이터는 있지만, 새로 고침등으로 소켓 아이디 변경시
    //소켓 아이디를 갱신
    else if (onlineAdvisor.socketId !== connection.socketId) {
      //기존 소켓 데이터 삭제
      await delKey(onlineAdvisor.socketId);
      onlineAdvisor.socketId = connection.socketId;
      //새로 고침 등으로 소켓 아이디가 달라졌으므로
      //소켓 아이디 - 사용자 아이디 연결을 갱신

      needToSaveData = true;
    }

    if (needToSaveData) {
      //접속 사용자 데이터와 소켓ID-사용자ID 데이터 추가
      await setValue(key, JSON.stringify(onlineAdvisor));
      await setValue(socket.id, id);
    }

    //전체 접속자 수 조회
    let totalConnected = await getKeys("online_advisor:*");
    if (totalConnected) {
      console.log(`total connected advisor count : ${totalConnected.length}`);
    }

    return next();
  }

  sendResponse(socket, "connected", {}, false);

  return next(new Error("사용자 아이디가 없음."));
};

/**
 * @param {object} io socket.io 객체
 * @param {object} socket 현재 접속한 socket 객체
 * @description 소켓에 상담원이 새로 접속
 */
export const connected = async (io, socket) => {
  console.log("유저 들어옴.");

  sendResponse(socket, "connected", {}, true);

  //TODO : 나를 제외한 다른 사람들에게 내가 조인했다는 걸 알려야 함.
  const onlineAdvisor = await getCurrentAdvisor(socket.id);
  //socket.broadcast.emit("lobby:advisor_connected", JSON.stringify(onlineAdvisor));
  let noti = {
    type: "lobby:advisor_connected",
    data: onlineAdvisor
  };
  socket.broadcast.emit("notification", noti);

  //현재 접속자 목록 가져오기
  const connectedList = await getConnectedAdvisorList();
  
  //접속한 상담원에게 현재 접속한 모든 상담원 목록 전송
  noti = {
    type: "lobby:total_advisor_connected",
    data: connectedList
  };
  //io.emit("lobby:total_advisor_connected", JSON.stringify(connectedList));
  io.emit("notification", noti);

  //접속한 상담원에게 현재 접속중인 고객수 전송
  const connectedCustomerCount = await getConnectedCustomerList();
  noti = {
    type: "event:total_customer_connected",
    data: connectedCustomerCount
  };
  //io.emit("event:total_customer_connected", connectedCustomerCount);
  io.emit("notification", noti);
};

/**
 * @param {object} socket 현재 접속한 socket 객체
 * @description 소켓 접속 종료 이벤트 핸들러
 */
export const disconnect = async (socket) => {  
  //socket.on("disconnect", async () => {
    console.log(`disconnect from : ${socket.id}`);
    //소켓ID와 연결된 사용자ID 조회
    let id = await getValue(socket.id);
    console.log(id);
    if (id) {
      await delKey(socket.id);
      await delKey(getAdvisorKey(id));
    }

    //TODO : 내가 나갔다는 걸 다른 사람들에게 알려야 함.
    let noti = {
      type: "lobby:advisor_disconnected",
      data: onlineAdvisor
    };
    // socket.broadcast.emit(
    //   "lobby:advisor_disconnected",
    //   JSON.stringify(onlineAdvisor)
    // );
    socket.broadcast.emit("notification", noti);

    console.log("유저 나감.");
  //});
};

/**
 * @param {object} socket 현재 접속한 socket 객체
 * @description 다른 상담원에게 채팅 요청 보내기
 */
export const chatRequest = async (socket, req) => {
  sendResponse(socket, "chatRequest", req, true);

  if(req.toCustomer) {
    console.log("상담원은 고객에게 채팅 요청 불가.");
    return;
  }

  //socket.on("chat:request_to_advisor", async (data) => {
  console.log(req);

  //룸을 생성해 조인
  socket.join(req.roomId);

  //다른 사용자에게도 메세지를 보내서 방에 접속하라고 알린다.
  let toAdvisor = await getValue(getAdvisorKey(req.toId));
  if (toAdvisor) {
    toAdvisor = JSON.parse(toAdvisor);
  }

  let noti = {
    type: "chat:received_request_from_advisor",
    data: req
  };
  // io.to(toAdvisor.socketId).emit("chat:received_request_from_advisor", req);
  //});
  io.to(toAdvisor.socketId).emit("notification", noti);
};

export const joinChat = (socket, req) => {
  sendResponse(socket, "joinChat", req, true);
  if(req.toCustomer) {
    acceptCustomerChatRequest(socket, req);
  }
  else {
    acceptAdvisorChatRequest(socket, req);
  }
};

/**
 * @param {object} socket 현재 접속한 socket 객체
 * @description 다른 상담원의 채팅 요청 수락하기
 */
const acceptAdvisorChatRequest = (socket, req) => {
  //socket.on("chat:join_with_advisor", async (data) => {
    console.log(req);

    socket.join(req.roomId);

    const joined = {
      roomId: req.roomId,
      username: "__system__",
      message: `${req.username}님이 대화에 참여합니다.`,
    };

    let noti = {
      type: "chat:joined_room",
      data: joined
    };

    //방에 접속한 사람들에게 내가 조인 했음을 알린다.
    // socket.to(req.roomId).emit("chat:joined_room", joined);
    socket.to(req.roomId).emit("notification", noti);
  //});
};

/**
 * @param {object} socket 현재 접속한 socket 객체
 * @description 고객의 채팅 요청 수락하기
 */
const acceptCustomerChatRequest = (socket, req) => {
  //socket.on("chat:join_with_customer", async (data) => {
    console.log(req);

    socket.join(req.roomId);

    const joined = {
      roomId: req.roomId,
      username: "__system__",
      message: `${req.username}님이 대화에 참여합니다.`,
    };

    const message = {
      type: "event:chat_joined",
      value: joined,
    };

    kafkaPublish(process.env.KAFKA_TO_CUSTOMER_TOPIC, JSON.stringify(message));
  //});
};

/**
 * @param {object} socket 현재 접속한 socket 객체
 * @description 채팅 방에서 나가기
 */
export const exitRoom = (socket, req) => {
  sendResponse(socket, "exitRoom", req, true);
  //socket.on("chat:exit_room", async (req) => {
    socket.leave(req.roomId);

    req.message = `${req.username}님이 대화에서 빠졌습니다.`;
    //시스템 메세지로 설정
    req.username = "__system__";

    if (req.toCustomer) {
      const message = {
        type: "event:chat_exit",
        value: req,
      };

      kafkaPublish(
        process.env.KAFKA_TO_CUSTOMER_TOPIC,
        JSON.stringify(message)
      );
    } else {
      let noti = {
        type: "chat:exited_room",
        data: req
      };

      //방에 접속한 사람들에게 내가 나갔음을 알린다.
      // socket.to(req.roomId).emit("chat:exited_room", req);
      socket.to(req.roomId).emit("notification", noti);
    }
  //});
};

/**
 * @param {object} socket 현재 접속한 socket 객체
 * @description 상담원 / 고객에게 메세지 보내기
 */
export const sendMessage = (socket, req) => {
  sendResponse(socket, "sendMessage", req, true);
  //socket.on("chat:new_message", async (req) => {
    //console.log(req);

    if (req.toCustomer) {
      const message = {
        type: "event:chat_message",
        value: req,
      };

      kafkaPublish(
        process.env.KAFKA_TO_CUSTOMER_TOPIC,
        JSON.stringify(message)
      );
    } else {
      let noti = {
        type: "chat:new_message",
        data: req
      };

      //roomId, name, message
      // socket.to(req.roomId).emit("chat:new_message", req);
      socket.to(req.roomId).emit("notification", noti);
    }
  //});
};
