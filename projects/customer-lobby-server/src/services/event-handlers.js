import { kafkaPublish } from "./kafka-producer";

/**
 * 상담원이 채팅방에 들어옴
 * @param {object} io socket.io 객체
 * @param {object} joined 채팅 참여 정보
 */
export const chatJoined = (io, joined) => {
  let noti = {
    type: "chat:accepted",
    data: joined
  };
  //먼저 채팅이 수락되었음을 알리기
  io.in(joined.roomId).emit("notification", noti);

  noti.type = "chat:joined_room";
  //그리고 채팅 방에 조인
  io.in(joined.roomId).emit("notification", noti);

  //채팅방에 조인 성공했음을 상담원에게 통지
  const message = {
    type: "event:chat_join_succeed",
    value: joined.roomId,
  };

  kafkaPublish(process.env.KAFKA_TO_ADMIN_TOPIC, JSON.stringify(message));
};

/**
 * 상담원이 보낸 메세지 수신
 * @param {object} io socket.io 객체
 * @param {object} chatMsg 채팅 메세지
 */
export const chatMessage = (io, chatMsg) => {
  let noti = {
    type: "chat:new_message",
    data: chatMsg
  };
  io.in(chatMsg.roomId).emit("notification", noti);
};

/**
 * 상담원이 채팅방에서 나감
 * @param {object} io socket.io 객체
 * @param {object} chatMsg 채팅 메세지
 */
export const chatExited = async (io, chatMsg) => {
  //TODO: socket.leave(chatMsg.roomId) 처리 필요.
  //내가 현재 접속 중인 socket을 가져오려면, id필요.
  //그러면 ChatMessage에 Id추가 필요.

  // const onlineUser = await getValue(getUserKey(chatMsg.id))
  // io.sockets.connected[onlineUser.socketId].leave(chatMsg.roomId);

  let noti = {
    type: "chat:exited_room",
    data: chatMsg
  };
  io.in(chatMsg.roomId).emit("notification", noti);
};
