import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Subject } from 'rxjs';
import { ChatMessage } from '../models/chat-message';
import { ChatRequestToAdvisor } from '../models/chat-request-to-advisor';
import { CustomerChatRequest } from '../models/customer-chat-request';
import { NotificationData } from '../models/notification-data';
import { PublishData } from '../models/publish-data';
import { ResponseData } from '../models/response-data';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private getResponseSource = new Subject<ResponseData>();
  private advisorConnectedSource = new Subject<any>();
  private totalAdvisorConnectedSource = new Subject<any>();
  private totalCustomerConnectedSource = new Subject<number>();
  private advisorDisconnectedSource = new Subject<any>();
  private receivedRequestFromAdvisorSource = new Subject<
    ChatRequestToAdvisor
  >();
  private joinedRoomSource = new Subject<ChatMessage>();
  private exitedRoomSource = new Subject<ChatMessage>();
  private newMessageSource = new Subject<ChatMessage>();
  private customerExitedSource = new Subject<ChatMessage>();
  private customerChatRequestSource = new Subject<CustomerChatRequest>();
  private customerCancelChatRequestSource = new Subject<CustomerChatRequest>();
  private customerDisconnectedSource = new Subject<string>();
  private joinChatSucceedSource = new Subject<string>();

  /**
   * publish에 대한 응답
   */
  getResponse$ = this.getResponseSource.asObservable();
  /**
   * 상담원 접속
   */
  advisorConnected$ = this.advisorConnectedSource.asObservable();
  /**
   * 현재 접속중인 상담원 수 변경(상담원의 접속으로 인한)
   */
  totalAdvisorConnected$ = this.totalAdvisorConnectedSource.asObservable();
  /**
   * 현재 접속중인 고객 수 변경(고객의 접속으로 인한)
   */
  totalCustomerConnected$ = this.totalCustomerConnectedSource.asObservable();
  /**
   * 상담원의 상담 시스템 접속 종료
   */
  advisorDisconnected$ = this.advisorDisconnectedSource.asObservable();
  /**
   * 다른 상담원의 채팅 요청
   */
  receivedRequestFromAdvisor$ = this.receivedRequestFromAdvisorSource.asObservable();
  /**
   * 고객 / 상담원의 채팅방 입장
   */
  joinedRoom$ = this.joinedRoomSource.asObservable();
  /**
   * 상담원이 채팅방을 나감
   */
  exitedRoom$ = this.exitedRoomSource.asObservable();
  /**
   * 채팅 메세지 수신
   */
  newMessage$ = this.newMessageSource.asObservable();
  /**
   * 고객이 채팅방을 나감
   */
  customerExited$ = this.customerExitedSource.asObservable();
  /**
   * 고객의 채팅 요청 수신
   */
  customerChatRequest$ = this.customerChatRequestSource.asObservable();
  /**
   * 고객의 채팅 요청 취소 수신
   */
  customerCancelChatRequest$ = this.customerCancelChatRequestSource.asObservable();
  /**
   * 고객의 상담 시스템 접속 종료
   */
  customerDisconnected$ = this.customerDisconnectedSource.asObservable();
  /**
   * 고객의 채팅 방에 입장 성공
   */
  joinChatSucceed$ = this.joinChatSucceedSource.asObservable();

  constructor(private socket: Socket) {
    this.socket.on('response', (res: ResponseData) => {
      this.getResponseSource.next(res);
    });

    this.socket.on('notification', (noti: NotificationData) => {
      switch (noti.type) {
        case 'lobby:advisor_connected':
          this.advisorConnectedSource.next(noti.data);
          break;
        case 'lobby:total_advisor_connected':
          this.totalAdvisorConnectedSource.next(noti.data);
          break;
        case 'event:total_customer_connected':
          this.totalCustomerConnectedSource.next(noti.data);
          break;
        case 'lobby:advisor_disconnected':
          this.advisorDisconnectedSource.next(noti.data);
          break;
        case 'chat:received_request_from_advisor':
          this.receivedRequestFromAdvisorSource.next(noti.data);
          break;
        case 'chat:joined_room':
          this.joinedRoomSource.next(noti.data);
          break;
        case 'chat:exited_room':
          this.exitedRoomSource.next(noti.data);
          break;
        case 'chat:new_message':
          this.newMessageSource.next(noti.data);
          break;
        case 'chat:customer_exited':
          this.customerExitedSource.next(noti.data);
          break;
        case 'event:customer_chat_request':
          this.customerChatRequestSource.next(noti.data);
          break;
        case 'event:customer_cancel_chat_request':
          this.customerCancelChatRequestSource.next(noti.data);
          break;
        case 'event:customer_disconnected':
          this.customerDisconnectedSource.next(noti.data);
          break;
        case 'event:chat_join_succeed':
          this.joinChatSucceedSource.next(noti.data);
          break;
        default:
          break;
      }
    });
  }

  /**
   * 상담원 시스템과 실시간 통신 접속
   * @param query 소켓 접속시 전송할 파라미터
   */
  connect(query) {
    this.socket.ioSocket.io.opts.query = query;
    this.socket.connect();
  }

  /**
   * 고객 / 상담원에게 메세지 전송
   * @param message 전송할 메세지 데이터
   */
  sendMessage(message: ChatMessage) {
    const data = <PublishData<ChatMessage>>{
      ...message,
      type: 'sendMessage',
    };

    this.socket.emit('publish', data);
  }

  /**
   * 다른 상담원에게 채팅 요청
   * @param chatReq 상담원용 채팅 요청 데이터
   */
  startChatWithAdvisor(chatReq: ChatRequestToAdvisor) {
    const data = <PublishData<ChatRequestToAdvisor>>{
      ...chatReq,
      type: 'chatRequest',
      toCustomer: false,
    };

    this.socket.emit('publish', data);
  }

  /**
   * 다른 상담원과의 채팅에 참여
   * @param joinChatData 채팅 참여 데이터
   */
  joinChatWithAdvisor(joinChatData: ChatMessage) {
    const data = <PublishData<ChatMessage>>{
      ...joinChatData,
      type: 'joinChat',
      toCustomer: false,
    };
    this.socket.emit('publish', data);
  }

  /**
   * 고객 과의 채팅에 참여
   * @param joinChatData 채팅 참여 데이터
   */
  joinChatWithCustomer(joinChatData: ChatMessage) {
    const data = <PublishData<ChatMessage>>{
      ...joinChatData,
      type: 'joinChat',
      toCustomer: true,
    };
    this.socket.emit('publish', data);
  }

  /**
   * 채팅 방에서 나가기
   * @param message 채팅 메세지 데이터
   */
  exitRoom(message: ChatMessage) {
    const data = <PublishData<ChatMessage>>{
      ...message,
      type: 'exitChat',
    };
    this.socket.emit('publish', data);
  }
}
