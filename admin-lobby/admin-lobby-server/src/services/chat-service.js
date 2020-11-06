require("dotenv").config();

import * as chat from "./chat-handlers";
import * as events from "./event-handlers";

import { kafkaSubscribe } from "./kafka-consumer";

export const initChatService = (io) => {
  /**
   * check user
   */
  io.use(chat.init);

  /**
   * Initialize socket.io
   */

  //https://socket.io/docs/emit-cheatsheet/
  io.on("connection", async (socket) => {
    await chat.connected(io, socket);

    socket.on("publish", async (req) => {
      switch(req.type) {
        case "disconnect":
          await chat.disconnect(socket);
          break;
        case "chatRequest":
          await chat.chatRequest(socket, req);
          break;
        case "joinChat":
          chat.joinChat(socket, req);
          break;
        case "exitChat":
          chat.exitRoom(socket, req);
          break;
        case "sendMessage":
          chat.sendMessage(socket, req);
          break;
        default:
          console.log(`wrong message type : ${req.type}`);
          break;
      }
    })

    // chat.disconnect(socket);

    // chat.sendChatRequestToAdvisor(socket);

    // chat.acceptAdvisorChatRequest(socket);

    // chat.acceptCustomerChatRequest(socket);

    // chat.exitRoom(socket);

    // chat.sendMessage(socket);
  });

  //------------------------카프카 관련---------------------------

  kafkaSubscribe(process.env.KAFKA_TO_ADMIN_TOPIC, (messageStr) => {
    const message = JSON.parse(messageStr);
    switch (message.type) {
      case "event:total_customer_connected":
        events.customerTotalConnected(io, message.value);
        break;
      case "event:customer_disconnected":
        events.customerDisconnected(io, message.value);
        break;
      case "event:customer_chat_request":
        events.customerChatRequest(io, message.value);
        break;
      case "event:customer_cancel_chat_request":
        events.customerCancelChatRequest(io, message.value);
        break;
      case "event:chat_joined":
        events.chatJoined(message.value);
        break;
      case "event:chat_message":
        events.chatMessage(io, message.value);
        break;
      case "event:chat_exit":
        events.chatExited(io, message.value);
        break;
      case "event:chat_join_succeed":
        events.chatJoinSucceed(io, message.value);
        break;
    }
  });
};
