require("dotenv").config();

import {
  getValue,
  setValue,
  getKeys,
  delKey
} from "./redis-connector";

import { kafkaSubscribe, kafkaDisconnect } from "./kafka-consumer";
import { kafkaPublish } from "./kafka-producer";

function initWebSocket(io) {
  /**
   * check user
   */
  io.use(async (socket, next) => {
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

      // let data = await getValue("online_users")
      //https://stackoverflow.com/questions/51766843/filter-keys-redis-based-on-condition-node-js
      //아래 검색은 전체 조회 할 때.
      //let data = await getValue("online_user:*")

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
        await delKey(onlineUser.socketId);
        onlineUser.socketId = connection.socketId;
        //새로 고침 등으로 소켓 아이디가 달라졌으므로
        //소켓 아이디 - 사용자 아이디 연결을 갱신

        needToSaveData = true;
        // const savedConnection =
        //   online_users.find(
        //     c => c.id == connection.id)

        // if(savedConnection &&
        //   savedConnection.socketId != connection.socketId) {
        //   savedConnection.socketId = connection.socketId
        // }
        // //데이터에 유저가 없는 경우 추가
        // else if(!savedConnection) {
        //   online_users.push(connection)
        // }
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
          type: "total_customer_connected",
          value: totalConnected.length,
        };

        kafkaPublish(process.env.KAFKA_TO_ADMIN_TOPIC, JSON.stringify(message));
      }

      return next();
    }

    return next(new Error("사용자 아이디가 없음."));
  });

  /**
   * Initialize socket.io
   */
  function getUserKey(id) {
    return `online_user:${id}`;
  }

  io.on("connection", async (socket) => {
    console.log("유저 들어옴.");

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
        type: "customer_disconnected",
        value: id,
      };

      kafkaPublish(process.env.KAFKA_TO_ADMIN_TOPIC, JSON.stringify(message));

      console.log("유저 나감.");
    });

    socket.on("customer-chat-request", async (chatReq) => {
      socket.join(chatReq.roomId);

      const message = {
        type: "customer_chat_request",
        value: chatReq,
      };
      kafkaPublish(process.env.KAFKA_TO_ADMIN_TOPIC, JSON.stringify(message));

      console.log(`상담원에게 채팅 요청 : ${chatReq.subject}`);
    });

    socket.on("customer-chat:canel-request", async (chatReq) => {
      socket.leave(chatReq.roomId);

      const message = {
        type: "customer_cancel_chat_request",
        value: chatReq,
      };
      kafkaPublish(process.env.KAFKA_TO_ADMIN_TOPIC, JSON.stringify(message));

      console.log(`상담원에게 채팅 요청 취소 : ${chatReq.subject}`);
    });

    socket.on("exitRoom", async (chatMsg) => {
      socket.leave(chatMsg.roomId);

      chatMsg.message = `${chatMsg.username}님이 대화에서 빠졌습니다.`;
      //시스템 메세지로 설정
      chatMsg.username = "__system__";

      const message = {
        type: "chat_exit",
        value: chatMsg,
      };

      kafkaPublish(process.env.KAFKA_TO_ADMIN_TOPIC, JSON.stringify(message));
    });

    socket.on("add-message", async (chatMsg) => {
      const message = {
        type: "chat_message",
        value: chatMsg,
      };

      kafkaPublish(process.env.KAFKA_TO_ADMIN_TOPIC, JSON.stringify(message));
    });
  });

  //------------------------Kafka------------------------------

  //상담원이 채팅방에 들어옴
  const chatJoined = (joined) => {
    //먼저 채팅이 수락되었음을 알리기
    io.in(joined.roomId).emit("customer-chat:accepted", joined);

    //그리고 채팅 방에 조인
    io.in(joined.roomId).emit("joinedRoom", joined);

    //채팅방에 조인 성공했음을 상담원에게 통지
    const message = {
      type: "chat:join-succeed",
      value: joined.roomId,
    };

    kafkaPublish(process.env.KAFKA_TO_ADMIN_TOPIC, JSON.stringify(message));
  };

  //상담원이 보낸 메세지 수신
  const chatMessage = (chatMsg) => {
    io.in(chatMsg.roomId).emit("new-message", chatMsg);
  };

  //상담원이 채팅방에서 나감
  const chatExited = async (chatMsg) => {
    //TODO: socket.leave(chatMsg.roomId) 처리 필요.
    //내가 현재 접속 중인 socket을 가져오려면, id필요.
    //그러면 ChatMessage에 Id추가 필요.

    // const onlineUser = await getValue(getUserKey(chatMsg.id))
    // io.sockets.connected[onlineUser.socketId].leave(chatMsg.roomId);

    io.in(chatMsg.roomId).emit("exitedRoom", chatMsg);
  };

  kafkaSubscribe(process.env.KAFKA_TO_CUSTOMER_TOPIC, (messageStr) => {
    const message = JSON.parse(messageStr);
    switch (message.type) {
      case "chat_joined":
        chatJoined(message.value);
        break;
      case "chat_message":
        chatMessage(message.value);
        break;
      case "chat_exit":
        chatExited(message.value);
        break;
    }
  });
}

export { initWebSocket };
