import { kafkaPublish } from "./kafka-producer";

/**
 * @param {object} io socket.io 객체
 * @param {object} joined 채팅 참여 정보
 * @description 상담원이 채팅방에 들어옴
 */
export const chatJoined = (io, joined) => {
  //먼저 채팅이 수락되었음을 알리기
  io.in(joined.roomId).emit("customer-chat:accepted", joined);

  //그리고 채팅 방에 조인
  io.in(joined.roomId).emit("joinedRoom", joined);

  //채팅방에 조인 성공했음을 상담원에게 통지
  const message = {
    type: "event:chat_join_succeed",
    value: joined.roomId,
  };

  kafkaPublish(process.env.KAFKA_TO_ADMIN_TOPIC, JSON.stringify(message));
};

/**
 * @param {object} io socket.io 객체
 * @param {object} chatMsg 채팅 메세지
 * @description 상담원이 보낸 메세지 수신
 */
export const chatMessage = (io, chatMsg) => {
  io.in(chatMsg.roomId).emit("new-message", chatMsg);
};

/**
 * @param {object} io socket.io 객체
 * @param {object} chatMsg 채팅 메세지
 * @description 상담원이 채팅방에서 나감
 */
export const chatExited = async (io, chatMsg) => {
  //TODO: socket.leave(chatMsg.roomId) 처리 필요.
  //내가 현재 접속 중인 socket을 가져오려면, id필요.
  //그러면 ChatMessage에 Id추가 필요.

  // const onlineUser = await getValue(getUserKey(chatMsg.id))
  // io.sockets.connected[onlineUser.socketId].leave(chatMsg.roomId);

  io.in(chatMsg.roomId).emit("exitedRoom", chatMsg);
};
