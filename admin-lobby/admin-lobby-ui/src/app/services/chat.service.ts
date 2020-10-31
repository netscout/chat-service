import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChatMessage } from "../models/chat-message";
import { ChatRequestToAdvisor } from '../models/chat-request-to-advisor';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private socket: Socket) {

  }

  // connect(query){
  //   this.socket.ioSocket.io.opts.query = query
  //   this.socket.connect();
  // }

  // advisorConnected() {
  //   return new Observable((observer) => {
  //     this.socket.on('advisor_connected', (data) => {

  //       observer.next(data);
  //     })
  //   })
  // }

  // advisorDisconnected() {
  //   return new Observable((observer) => {
  //     this.socket.on('advisor_disconnected', (data) => {

  //       observer.next(data);
  //     })
  //   })
  // }

  // getTotalConnectedAdvisorList() {
  //   return new Observable((observer) => {
  //     this.socket.on('total_advisor_connected', (data) => {

  //       observer.next(data);
  //     })
  //   })
  // }

  // customerTotalConnected() {
  //   return new Observable((observer) => {
  //     this.socket.on('event:total_customer_connected', (count) => {

  //       observer.next(count);
  //     })
  //   })
  // }

  // customerDisconnected() {
  //   return new Observable((observer) => {
  //     this.socket.on('event:customer_disconnected', (id) => {

  //       observer.next(id);
  //     })
  //   })
  // }

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

  customerExited() {
    return new Observable((observer) => {
      this.socket.on('chat:customer-exited', (chatMsg: ChatMessage) => {
        observer.next(chatMsg);
      })
    })
  }
}
