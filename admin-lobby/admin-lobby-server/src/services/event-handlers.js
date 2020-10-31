//상담원에게 보내야 하는 메세지라면
//레디스에서 소켓 ID를 구해서
//io.sockets.connected[socketId]

/**
 * @param {object} io socket.io 객체
 * @param {number} count 
 * @description 현재 접속 중인 전체 고객 수 알림 처리
 */
export const customerTotalConnected = (io, count) => {
  io.emit("event:total_customer_connected", count);
};

/**
 * @param {object} io socket.io 객체
 * @param {string} id 접속 종료한 고객 uuid string
 * @description 고객 접속 종료 알림
 */
export const customerDisconnected = (io, id) => {
  io.emit("event:customer_disconnected", id);
};

/**
 * @param {object} io socket.io 객체
 * @param {object} chatReq 채팅 요청 정보
 * @description 고객이 상담 요청함
 */
export const customerChatRequest = (io, chatReq) => {
  io.emit("event:customer_chat_request", chatReq);
};

/**
 * @param {object} io socket.io 객체
 * @param {object} chatReq 채팅 요청 정보
 * @description 고객이 상담 요청 취소함
 */
export const customerCancelChatRequest = (io, chatReq) => {
  io.emit("event:customer_cancel_chat_request", chatReq);
};

/**
 * @param {요청 데이터} data 
 * @description 고객이 채팅방에 입장(고객이 먼저 요청하므로 호출되지 않음)
 */
export const chatJoined = (data) => {
  console.log(data);
};

/**
 * @param {object} io socket.io 객체
 * @param {object} chatMsg 채팅 메세지
 * @description 고객의 채팅 메세지 수신
 */
export const chatMessage = (io, chatMsg) => {
  io.in(chatMsg.roomId).emit("new-message", chatMsg);
};

/**
 * @param {object} io socket.io 객체
 * @param {object} chatMsg 채팅 메세지
 * @description 고객이 채팅방에서 나감
 */
export const chatExited = (io, chatMsg) => {
  console.log(chatMsg);

  io.in(chatMsg.roomId).emit("chat:customer-exited", chatMsg);
};

/**
 * @param {object} io socket.io 객체
 * @param {string} roomId 채팅방 uuid string
 * @description 고객이 상담요청한 채팅방에 입장 성공
 */
export const chatJoinSucceed = (io, roomId) => {
  io.in(roomId).emit("event:chat_join_succeed", roomId);
};
