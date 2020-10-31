import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChatData } from '../models/chat-data';
import { ChatMessage } from "../models/chat-message";
import { ChatRequestToAdvisor } from '../models/chat-request-to-advisor';

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

  advisorConnected() {
    return new Observable((observer) => {
      this.socket.on('advisor_connected', (data) => {

        observer.next(data);
      })
    })
  }

  advisorDisconnected() {
    return new Observable((observer) => {
      this.socket.on('advisor_disconnected', (data) => {

        observer.next(data);
      })
    })
  }

  getTotalConnectedAdvisorList() {
    return new Observable((observer) => {
      this.socket.on('total_advisor_connected', (data) => {

        observer.next(data);
      })
    })
  }

  totalCustomerConnected() {
    return new Observable((observer) => {
      this.socket.on('event:total_customer_connected', (count) => {

        observer.next(count);
      })
    })
  }

  customerChatRequest() {
    return new Observable((observer) => {
      this.socket.on('event:customer_chat_request', (chatReq) => {

        observer.next(chatReq);
      })
    });
  }

  customerCancelChatRequest() {
    return new Observable((observer) => {
      this.socket.on('event:customer_cancel_chat_request', (chatReq) => {

        observer.next(chatReq);
      })
    });
  }

  customerDisconnected() {
    return new Observable((observer) => {
      this.socket.on('event:customer_disconnected', (id) => {

        observer.next(id);
      })
    })
  }

  startChatWithAdvisor(chatReq: ChatRequestToAdvisor) {
    this.socket.emit('start_chat_with_advisor', chatReq);
  }

  //TODO : 상담원과의 대화 참여나 고객과의 대화 참여나 같지 않나?
  joinChatWithAdvisor(joinChatData) {
    this.socket.emit('join_chat_with_advisor', joinChatData);
  }

  joinChatWithCustomer(joinChatData) {
    this.socket.emit('join_chat_with_customer', joinChatData);
  }

  joinChatSucceed() {
    return new Observable((observer) => {
      this.socket.on('event:chat_join_succeed', (roomId) => {
        observer.next(roomId);
      })
    })
  }

  invitedChatWith() {
    return new Observable((observer) => {
      this.socket.on('invited_chat_with', (data) => {
        observer.next(data);
      })
    })
  }

  exitRoom(message: ChatMessage) {
    this.socket.emit('exitRoom', message);
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
