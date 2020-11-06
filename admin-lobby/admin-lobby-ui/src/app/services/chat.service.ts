import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChatMessage } from "../models/chat-message";
import { ChatRequestToAdvisor } from '../models/chat-request-to-advisor';
import { CustomerChatRequest } from '../models/customer-chat-request';
import { NotificationData } from '../models/notification-data';
import { PublishData } from '../models/publish-data';
import { ResponseData } from '../models/response-data';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private getResponseSource = new Subject<ResponseData>();
  private advisorConnectedSource = new Subject<any>();
  private totalAdvisorConnectedSource = new Subject<any>();
  private totalCustomerConnectedSource = new Subject<number>();
  private advisorDisconnectedSource = new Subject<any>();
  private receivedRequestFromAdvisorSource = new Subject<ChatRequestToAdvisor>();
  private joinedRoomSource = new Subject<ChatMessage>();
  private exitedRoomSource = new Subject<ChatMessage>();
  private newMessageSource = new Subject<ChatMessage>();
  private customerExitedSource = new Subject<ChatMessage>();
  private customerChatRequestSource = new Subject<CustomerChatRequest>();
  private customerCancelChatRequestSource = new Subject<CustomerChatRequest>();
  private customerDisconnectedSource = new Subject<string>();
  private joinChatSucceedSource = new Subject<string>();

  getResponse$ = this.getResponseSource.asObservable();
  advisorConnected$ = this.advisorConnectedSource.asObservable();
  totalAdvisorConnected$ = this.totalAdvisorConnectedSource.asObservable();
  totalCustomerConnected$ = this.totalCustomerConnectedSource.asObservable();
  advisorDisconnected$ = this.advisorDisconnectedSource.asObservable();
  receivedRequestFromAdvisor$ = this.receivedRequestFromAdvisorSource.asObservable();
  joinedRoom$ = this.joinedRoomSource.asObservable();
  exitedRoom$ = this.exitedRoomSource.asObservable();
  newMessage$ = this.newMessageSource.asObservable();
  customerExited$ = this.customerExitedSource.asObservable();
  customerChatRequest$ = this.customerChatRequestSource.asObservable();
  customerCancelChatRequest$ = this.customerCancelChatRequestSource.asObservable();
  customerDisconnected$ = this.customerDisconnectedSource.asObservable();
  joinChatSucceed$ = this.joinChatSucceedSource.asObservable();

  constructor(private socket: Socket) {
    this.socket.on("response", (res:ResponseData) => {
      this.getResponseSource.next(res);
    });

    this.socket.on("notification", (noti:NotificationData) => {
      switch(noti.type) {
        case "lobby:advisor_connected":
          this.advisorConnectedSource.next(noti.data);
          break;
        case "lobby:total_advisor_connected":
          this.totalAdvisorConnectedSource.next(noti.data);
          break;
        case "event:total_customer_connected":
          this.totalCustomerConnectedSource.next(noti.data);
          break;
        case "lobby:advisor_disconnected":
          this.advisorDisconnectedSource.next(noti.data);
          break;
        case "chat:received_request_from_advisor":
          this.receivedRequestFromAdvisorSource.next(noti.data);
          break;
        case "chat:joined_room":
          this.joinedRoomSource.next(noti.data);
          break;
        case "chat:exited_room":
          this.exitedRoomSource.next(noti.data);
          break;
        case "chat:new_message":
          this.newMessageSource.next(noti.data);
          break;
        case "chat:customer_exited":
          this.customerExitedSource.next(noti.data);
          break;
        case "event:customer_chat_request":
          this.customerChatRequestSource.next(noti.data);
          break;
        case "event:customer_cancel_chat_request":
          this.customerCancelChatRequestSource.next(noti.data);
          break;
        case "event:customer_disconnected":
          this.customerDisconnectedSource.next(noti.data);
          break;
        case "event:chat_join_succeed":
          this.joinChatSucceedSource.next(noti.data);
          break;
        default:
          break;
      }
    });
  }

  connect(query){
    this.socket.ioSocket.io.opts.query = query
    this.socket.connect();
  }

  sendMessage(message: ChatMessage) {
    const data = <PublishData>{
      ...message,
      type: "sendMessage"
    };

    this.socket.emit('publish', data);
  }

  startChatWithAdvisor(chatReq: ChatRequestToAdvisor) {
    const data = <PublishData>{
      ...chatReq,
      type: "chatRequest",
      toCustomer: false
    };

    this.socket.emit('publish', data);
  }

  //TODO : 상담원과의 대화 참여나 고객과의 대화 참여나 같지 않나?
  joinChatWithAdvisor(joinChatData) {
    const data = <PublishData>{
      ...joinChatData,
      type: "joinChat",
      toCustomer: false
    };
    this.socket.emit('publish', data);
  }

  joinChatWithCustomer(joinChatData) {
    const data = <PublishData>{
      ...joinChatData,
      type: "joinChat",
      toCustomer: true
    };
    this.socket.emit('publish', data);
  }

  exitRoom(message: ChatMessage) {
    const data = <PublishData>{
      ...message,
      type: "exitChat"
    }
    this.socket.emit('publish', data);
  }
}
