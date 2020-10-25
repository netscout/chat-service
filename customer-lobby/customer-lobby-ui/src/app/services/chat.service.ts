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
      this.socket.on('joinedRoom', (data) => {
        observer.next(data);
      })
    })
  }

  sendMessage(message: ChatMessage) {
    this.socket.emit('add-message', message);
  }

  getMessage() {
    return new Observable((observer) => {
      this.socket.on('new-message', (message) => {
        console.log(message);
        observer.next(message);
      })
    })
    // return this.socket
    //   .fromEvent("message")
    //   .pipe(map((data) => data.msg));
  }

  exitedRoom() {
    return new Observable((observer) => {
      this.socket.on('exitedRoom', (data) => {
        observer.next(data);
      })
    })
  }
}
