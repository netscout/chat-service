import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChatMessage } from '../models/chat-message';
import { CustomerChatRequest } from '../models/customer-chat-request';
import { Message } from "../models/message";

@Injectable({
  providedIn: 'root'
})
export class LobbyService {
  constructor(private socket: Socket) {

  }

  connect(query){
    this.socket.ioSocket.io.opts.query = query
    this.socket.connect();
  }

  exitRoom(message: ChatMessage) {
    this.socket.emit('exitRoom', message);
  }

  requestChat(chatReq: CustomerChatRequest) {
    this.socket.emit('customer-chat-request', chatReq);
  }

  cancelChat(chatReq: CustomerChatRequest) {
    this.socket.emit('customer-chat:canel-request', chatReq);
  }

  requestAccepted() {
    return new Observable((observer) => {
      this.socket.on('customer-chat:accepted', (data) => {
        observer.next(data);
      })
    })
  }

  // getMessages() {
  //   return new Observable((observer) => {
  //     this.socket.on('new-meesage', (message) => {
  //       observer.next(message);
  //     })
  //   })
  //   // return this.socket
  //   //   .fromEvent("message")
  //   //   .pipe(map((data) => data.msg));
  // }
}
