require("dotenv").config();
import {
  getValue,
  setValue,
  getKeys,
  delKey
} from "./redis-connector";

import { kafkaSubscribe, kafkaDisconnect } from "./kafka-consumer";
import { kafkaPublish } from "./kafka-producer";

/**
 * check user
 */
function initWebSocket(io) {
  io.use(async (socket, next) => {
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

    return next(new Error("사용자 아이디가 없음."));
  });

  /**
   * Initialize socket.io
   */

  function getAdvisorKey(id) {
    return `online_advisor:${id}`;
  }

  async function getConnectedAdvisorList() {
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
  }

  async function getConnectedCustomerList() {
    //전체 접속자 수 조회
    let totalConnected = await getKeys("online_user:*");

    return !!totalConnected ? totalConnected.length : 0;
  }

  async function getCurrentAdvisor(socketId) {
    const id = await getValue(socketId);
    const onlineAdvisor = await getValue(getAdvisorKey(id));

    if (onlineAdvisor.hasOwnProperty("socketId")) {
      delete onlineAdvisor.socketId;
    }

    return onlineAdvisor;
  }

  //https://socket.io/docs/emit-cheatsheet/
  io.on("connection", async (socket) => {
    console.log("유저 들어옴.");

    //TODO : 나를 제외한 다른 사람들에게 내가 조인했다는 걸 알려야 함.
    const onlineAdvisor = await getCurrentAdvisor(socket.id);
    socket.broadcast.emit("advisor_connected", JSON.stringify(onlineAdvisor));

    //현재 접속자 목록 가져오기
    const connectedList = await getConnectedAdvisorList();

    //접속한 상담원에게 현재 접속한 모든 상담원 목록 전송
    io.emit("total_advisor_connected", JSON.stringify(connectedList));

    //접속한 상담원에게 현재 접속중인 고객수 전송
    const connectedCustomerCount = await getConnectedCustomerList();
    io.emit("total_customer_connected", connectedCustomerCount);

    socket.on("disconnect", async () => {
      console.log(`disconnect from : ${socket.id}`);
      //소켓ID와 연결된 사용자ID 조회
      let id = await getValue(socket.id);
      console.log(id);
      if (id) {
        await delKey(socket.id);
        await delKey(getAdvisorKey(id));
      }

      //TODO : 내가 나갔다는 걸 다른 사람들에게 알려야 함.
      socket.broadcast.emit(
        "advisor_disconnected",
        JSON.stringify(onlineAdvisor)
      );

      console.log("유저 나감.");
    });

    socket.on("start_chat_with_advisor", async (data) => {
      console.log(data);

      //룸을 생성해 조인
      socket.join(data.roomId);

      //다른 사용자에게도 메세지를 보내서 방에 접속하라고 알린다.
      let toAdvisor = await getValue(getAdvisorKey(data.toId));
      if (toAdvisor) {
        toAdvisor = JSON.parse(toAdvisor);
      }

      io.to(toAdvisor.socketId).emit("invited_chat_with", data);
    });

    socket.on("join_chat_with_advisor", async (data) => {
      console.log(data);

      socket.join(data.roomId);

      const joined = {
        roomId: data.roomId,
        username: "__system__",
        message: `${data.username}님이 대화에 참여합니다.`,
      };

      //방에 접속한 사람들에게 내가 조인 했음을 알린다.
      socket.to(data.roomId).emit("joinedRoom", joined);
    });

    socket.on("join_chat_with_customer", async (data) => {
      console.log(data);

      socket.join(data.roomId);

      const joined = {
        roomId: data.roomId,
        username: "__system__",
        message: `${data.username}님이 대화에 참여합니다.`,
      };

      const message = {
        type: "chat_joined",
        value: joined,
      };

      kafkaPublish(
        process.env.KAFKA_TO_CUSTOMER_TOPIC,
        JSON.stringify(message)
      );
    });

    socket.on("exitRoom", async (chatMsg) => {
      socket.leave(chatMsg.roomId);

      chatMsg.message = `${chatMsg.username}님이 대화에서 빠졌습니다.`;
      //시스템 메세지로 설정
      chatMsg.username = "__system__";

      if (chatMsg.toCustomer) {
        const message = {
          type: "chat_exit",
          value: chatMsg,
        };

        kafkaPublish(
          process.env.KAFKA_TO_CUSTOMER_TOPIC,
          JSON.stringify(message)
        );
      } else {
        //방에 접속한 사람들에게 내가 나갔음을 알린다.
        socket.to(chatMsg.roomId).emit("exitedRoom", chatMsg);
      }
    });

    socket.on("add-message", async (chatMsg) => {
      console.log(chatMsg);

      if (chatMsg.toCustomer) {
        const message = {
          type: "chat_message",
          value: chatMsg,
        };

        kafkaPublish(
          process.env.KAFKA_TO_CUSTOMER_TOPIC,
          JSON.stringify(message)
        );
      } else {
        //roomId, name, message
        socket.to(chatMsg.roomId).emit("new-message", chatMsg);
      }
    });
  });

  //------------------------카프카 관련---------------------------

//상담원에게 보내야 하는 메세지라면
//레디스에서 소켓 ID를 구해서
//io.sockets.connected[socketId]
const customerTotalConnected = (count) => {
    io.emit("total_customer_connected", count);
  };
  
  //고객 접속 종료 알림
  const customerDisconnected = (id) => {
    io.emit("customer_disconnected", id);
  };
  
  //고객이 상담 요청함
  const customerChatRequest = (chatReq) => {
    io.emit("customer_chat_request", chatReq);
  };
  
  //고객이 상담 요청 취소함
  const customerCancelChatRequest = (chatReq) => {
    io.emit("customer_cancel_chat_request", chatReq);
  };
  
  //고객이 채팅방에 입장(고객이 먼저 요청하므로 호출되지 않음)
  const chatJoined = (data) => {
    console.log(data);
  };
  
  const chatMessage = (chatMsg) => {
    io.in(chatMsg.roomId).emit("new-message", chatMsg);
  };
  
  const chatExited = (chatMsg) => {
    console.log(chatMsg);
  
    io.in(chatMsg.roomId).emit("chat:customer-exited", chatMsg);
  };
  
  const chatJoinSucceed = (roomId) => {
    io.in(roomId).emit("chat:join-succeed", roomId);
  };
  
  kafkaSubscribe(process.env.KAFKA_TO_ADMIN_TOPIC, (messageStr) => {
    const message = JSON.parse(messageStr);
    switch (message.type) {
      case "total_customer_connected":
        customerTotalConnected(message.value);
        break;
      case "customer_disconnected":
        customerDisconnected(message.value);
        break;
      case "customer_chat_request":
        customerChatRequest(message.value);
        break;
      case "customer_cancel_chat_request":
        customerCancelChatRequest(message.value);
        break;
      case "chat_joined":
        chatJoined(message.value);
        break;
      case "chat_message":
        chatMessage(message.value);
        break;
      case "chat_exit":
        chatExited(message.value);
        break;
      case "chat:join-succeed":
        chatJoinSucceed(message.value);
        break;
    }
  });
}

export { initWebSocket }