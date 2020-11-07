//상담원에게 보내야 하는 메세지라면
//레디스에서 소켓 ID를 구해서
//io.sockets.connected[socketId]

/**
 * 현재 접속 중인 전체 고객 수 알림 처리
 * @param {object} io socket.io 객체
 * @param {number} count
 */
export const customerTotalConnected = (io, count) => {
  const noti = {
    type: "event:total_customer_connected",
    data: count
  };
  io.emit("notification", noti);
};

/**
 * 고객 접속 종료 알림
 * @param {object} io socket.io 객체
 * @param {string} id 접속 종료한 고객 uuid string
 */
export const customerDisconnected = (io, id) => {
  const noti = {
    type: "event:customer_disconnected",
    data: id
  };
  io.emit("notification", noti);
};

/**
 * 고객이 상담 요청함
 * @param {object} io socket.io 객체
 * @param {object} chatReq 채팅 요청 정보
 */
export const customerChatRequest = (io, chatReq) => {
  const noti = {
    type: "event:customer_chat_request",
    data: chatReq
  };
  io.emit("notification", noti);
};

/**
 * 고객이 상담 요청 취소함
 * @param {object} io socket.io 객체
 * @param {object} chatReq 채팅 요청 정보
 */
export const customerCancelChatRequest = (io, chatReq) => {
  const noti = {
    type: "event:customer_cancel_chat_request",
    data: chatReq
  };
  io.emit("notification", noti);
};

/**
 * 고객이 채팅방에 입장(고객이 먼저 요청하므로 호출되지 않음)
 * @param {object} data 요청 데이터
 */
export const chatJoined = (data) => {
  console.log(data);
};

/**
 * 고객의 채팅 메세지 수신
 * @param {object} io socket.io 객체
 * @param {object} chatMsg 채팅 메세지
 */
export const chatMessage = (io, chatMsg) => {
  const noti = {
    type: "chat:new_message",
    data: chatMsg
  };
  io.in(chatMsg.roomId).emit("notification", noti);
};

/**
 * 고객이 채팅방에서 나감
 * @param {object} io socket.io 객체
 * @param {object} chatMsg 채팅 메세지
 */
export const chatExited = (io, chatMsg) => {
  const noti = {
    type: "chat:customer_exited",
    data: chatMsg
  };
  io.in(chatMsg.roomId).emit("notification", noti);
};

/**
 * 고객이 상담요청한 채팅방에 입장 성공
 * @param {object} io socket.io 객체
 * @param {string} roomId 채팅방 uuid string
 */
export const chatJoinSucceed = (io, roomId) => {
  const noti = {
    type: "event:chat_join_succeed",
    data: roomId
  };
  io.in(roomId).emit("notification", noti);
};
