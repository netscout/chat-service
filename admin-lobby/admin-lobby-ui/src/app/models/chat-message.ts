export class ChatMessage {
  roomId: string;
  userId: string;
  username: string;
  message: string;
  toCustomer: boolean;

  constructor(
    roomId: string,
    userId: string,
    username: string,
    message: string,
    toCustomer:boolean) {
    this.roomId = roomId;
    this.userId = userId;
    this.username = username;
    this.message = message;
    this.toCustomer = toCustomer;
  }
}
