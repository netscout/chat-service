export class CustomerChatRequest {
  id: string;
  username: string;
  subject: string;
  roomId: string;

  constructor(
    id: string,
    username: string,
    subject: string,
    roomId: string) {
    this.id = id;
    this.username = username;
    this.subject = subject;
    this.roomId = roomId;
  }
}
