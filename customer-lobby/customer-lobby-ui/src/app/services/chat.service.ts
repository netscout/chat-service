import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChatMessage } from '../models/chat-message';
import { CustomerChatRequest } from '../models/customer-chat-request';
import { NotificationData } from '../models/notification-data';
import { PublishData } from '../models/publish-data';
import { ResponseData } from '../models/response-data';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private getResponseSource = new Subject<ResponseData>();
  private chatAcceptedSource = new Subject<ChatMessage>();
  private joinedRoomSource = new Subject<ChatMessage>();
  private newMessageSource = new Subject<ChatMessage>();
  private exitedRoomSource = new Subject<ChatMessage>();

  /**
   * publish에 대한 응답
   */
  getResponse$ = this.getResponseSource.asObservable();
  /**
   * 상담 요청 수락됨
   */
  chatAccepted$ = this.chatAcceptedSource.asObservable();
  /**
   * 상담원이 채팅방에 들어옴
   */
  joinedRoom$ = this.joinedRoomSource.asObservable();
  /**
   * 새 채팅 메세지 수신
   */
  newMessage$ = this.newMessageSource.asObservable();
  /**
   * 상담원이 채팅방에서 나감
   */
  exitedRoom$ = this.exitedRoomSource.asObservable();

  constructor(private socket: Socket) {
    this.socket.on('response', (res: ResponseData) => {
      this.getResponseSource.next(res);
    });

    this.socket.on('notification', (noti: NotificationData) => {
      switch (noti.type) {
        case "chat:accepted":
          this.chatAcceptedSource.next(noti.data);
          break;
          case "chat:joined_room":
          this.joinedRoomSource.next(noti.data);
          break;
          case "chat:new_message":
          this.newMessageSource.next(noti.data);
          break;
          case "chat:exited_room":
          this.exitedRoomSource.next(noti.data);
          break;
        default:
          break;
      }
    });
  }

  /**
   * 고객 상담 시스템과 실시간 통신 접속
   * @param query 소켓 접속시 전송할 파라미터
   */
  connect(query){
    this.socket.ioSocket.io.opts.query = query
    this.socket.connect();
  }

  /**
   * 채팅 방에서 나가기
   * @param message 채팅 메세지 데이터
   */
  exitRoom(message: ChatMessage) {
    const data = <PublishData<ChatMessage>>{
      ...message,
      type: "exitChat"
    };
    this.socket.emit('publish', data);
  }

  /**
   * 상담원에게 상담 요청하기
   * @param chatReq 고객용 채팅 요청 데이터
   */
  requestChat(chatReq: CustomerChatRequest) {
    const data = <PublishData<CustomerChatRequest>>{
      ...chatReq,
      type: "chatRequest"
    };
    this.socket.emit('publish', data);
  }

  /**
   * 채팅 요청 취소하기
   * @param chatReq 고객용 채팅 요청 데이터
   */
  cancelChat(chatReq: CustomerChatRequest) {
    const data = <PublishData<CustomerChatRequest>>{
      ...chatReq,
      type: "cancelChatRequest"
    };
    this.socket.emit('publish', data);
  }

  /**
   * 채팅 메세지 전송하기
   * @param message 채팅 메세지 데이터
   */
  sendMessage(message: ChatMessage) {
    const data = <PublishData<ChatMessage>>{
      ...message,
      type: "sendMessage"
    }
    this.socket.emit('publish', data);
  }
}
