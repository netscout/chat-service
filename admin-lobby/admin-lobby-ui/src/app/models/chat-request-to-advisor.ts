import { from } from 'rxjs';

export class ChatRequestToAdvisor {
  roomId: string;
  fromId: string;
  toId: string;

  constructor(roomId: string, fromId: string, toId: string) {
    this.roomId = roomId;
    this.fromId = fromId;
    this.toId = toId;
  }
}
