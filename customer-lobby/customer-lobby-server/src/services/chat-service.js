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
  io.on("connection", async (socket) => {
    console.log("유저 들어옴.");

    chat.disconnect(socket);

    chat.sendChatRequest(socket);

    chat.cancelChatRequest(socket);

    chat.exitRoom(socket);

    chat.sendMessage(socket);
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
}