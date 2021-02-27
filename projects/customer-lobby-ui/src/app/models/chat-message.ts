export class ChatMessage {
  roomId: string;
  username: string;
  message: string;

  constructor(roomId: string, username: string, message: string) {
    this.roomId = roomId;
    this.username = username;
    this.message = message;
  }
}
