require("dotenv").config();
import logger from "../libs/logger";
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
  io.on("connection", async (socket) => {
    chat.connected(socket);

    chat.disconnect(socket);

    socket.on("publish", async (req) => {
      switch (req.type) {
        case "chatRequest":
          chat.sendChatRequest(socket, req);
          break;
        case "cancelChatRequest":
          chat.cancelChatRequest(socket, req);
          break;
        case "exitChat":
          chat.exitRoom(socket, req);
          break;
        case "sendMessage":
          chat.sendMessage(socket, req);
          break;
        default:
          logger.log('error',`wrong message type : ${req.type}`);
          break;
      }
    });
  });

  //------------------------Kafka------------------------------

  kafkaSubscribe(process.env.KAFKA_TO_CUSTOMER_TOPIC, (messageStr) => {
    const message = JSON.parse(messageStr);
    switch (message.type) {
      case "event:chat_joined":
        events.chatJoined(io, message.value);
        break;
      case "event:chat_message":
        events.chatMessage(io, message.value);
        break;
      case "event:chat_exit":
        events.chatExited(io, message.value);
        break;
    }
  });
};
