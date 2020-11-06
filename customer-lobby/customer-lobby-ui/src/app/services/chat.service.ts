import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChatMessage } from "../models/chat-message";

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private socket: Socket) {

  }

  joinedRoom() {
    return new Observable((observer) => {
      this.socket.on('chat:joined_room', (data) => {
        observer.next(data);
      })
    })
  }

  sendMessage(message: ChatMessage) {
    this.socket.emit('chat:new_message', message);
  }

  getMessage() {
    return new Observable((observer) => {
      this.socket.on('chat:new_message', (message) => {
        console.log(message);
        observer.next(message);
      })
    })
  }

  exitedRoom() {
    return new Observable((observer) => {
      this.socket.on('chat:exited_room', (data) => {
        observer.next(data);
      })
    })
  }
}
