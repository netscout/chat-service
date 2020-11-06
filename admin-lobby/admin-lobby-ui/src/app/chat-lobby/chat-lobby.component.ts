import { Component, OnDestroy, OnInit } from '@angular/core';
import { Role } from '../models/role';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticationService } from '../services/authentication.service';
import { LobbyService } from '../services/lobby.service';
import { ChatRequestToAdvisor } from '../models/chat-request-to-advisor';
import { ChatMessage } from '../models/chat-message';
import roleDict from '../models/role-dict';
import statusDict from '../models/status-dict';
import { ChatRoom } from '../models/chat-room';
import { CustomerChatRequest } from '../models/customer-chat-request';
import { User } from '../models/user';
import { ChatService } from '../services/chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-lobby',
  templateUrl: './chat-lobby.component.html',
  styleUrls: ['./chat-lobby.component.css'],
})
export class ChatLobbyComponent implements OnInit, OnDestroy {
  private eventSubscriptions: Subscription[] = [];
  roles: Role[] = [
    {
      id: 1,
      title: '매니저',
    },
    {
      id: 2,
      title: '상담원',
    },
  ];
  currentUser: User;
  connectedAdvisorList = [];
  requestedCustomerList: CustomerChatRequest[] = [];
  chatRoomList: ChatRoom[] = [];
  connectedCustomerCount = 0;

  subject: string = '상담 요청 이유';
  onRequestChat: boolean = false;
  onChat: boolean = false;

  constructor(
    //private lobbyService: LobbyService,
    private authService: AuthenticationService,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;

    this.chatService.connect({
      id: this.currentUser.id,
      username: this.currentUser.name,
      role: this.currentUser.roleId,
    });

    this.eventSubscriptions.push(
      this.chatService.totalAdvisorConnected$.subscribe((data: any) => {
        this.connectedAdvisorList = JSON.parse(data);
      })
    );

    this.eventSubscriptions.push(
      this.chatService.advisorConnected$.subscribe((connected: any) => {
        this.connectedAdvisorList.push(connected);
      })
    );

    this.eventSubscriptions.push(
      this.chatService.advisorDisconnected$.subscribe((disconnected: any) => {
        const index = this.connectedAdvisorList.findIndex(
          (ad) => ad.id === disconnected.id
        );
        if (index !== -1) {
          this.connectedAdvisorList.splice(index, 1);
        }
      })
    );

    this.eventSubscriptions.push(
      this.chatService.totalCustomerConnected$.subscribe((count: number) => {
        this.connectedCustomerCount = count;
      })
    );

    this.eventSubscriptions.push(
      this.chatService.receivedRequestFromAdvisor$.subscribe(
        (chatReq: ChatRequestToAdvisor) => {
          this.joinChatWithAdvisor(chatReq);
        }
      )
    );

    this.eventSubscriptions.push(
      this.chatService.customerChatRequest$.subscribe(
        (chatReq: CustomerChatRequest) => {
          this.requestedCustomerList.push(chatReq);
        }
      )
    );

    this.eventSubscriptions.push(
      this.chatService.customerCancelChatRequest$.subscribe(
        (chatReq: CustomerChatRequest) => {
          const reqIdx = this.requestedCustomerList.findIndex(
            (r) => r.roomId == chatReq.roomId
          );
          this.requestedCustomerList.splice(reqIdx, 1);
        }
      )
    );

    this.eventSubscriptions.push(
      this.chatService.customerDisconnected$.subscribe((id: string) => {
        //TODO: 고객의 id로 처리해야 할 게 있다면 추가
        if (this.connectedCustomerCount > 0) {
          this.connectedCustomerCount -= 1;
        }
      })
    );

    this.eventSubscriptions.push(
      this.chatService.joinChatSucceed$.subscribe((roomId: string) => {
        const reqIdx = this.requestedCustomerList.findIndex(
          (r) => r.roomId == roomId
        );
        this.requestedCustomerList.splice(reqIdx, 1);
      })
    );
  }

  public get getRoleTitle(): string {
    const role = this.roles.find((r) => r.id == this.currentUser.roleId);
    if (role) {
      return role.title;
    }

    return '미정';
  }

  startChatWithAdvisor(id: string) {
    //여기서 나는 방을 만들어서 입장하고, 그 방에 상대방도 입장시켜야 한다.
    const roomId = uuidv4();
    const chatRoom = new ChatRoom(roomId, [this.currentUser.id, id], false);
    this.chatRoomList.push(chatRoom);

    const chatReq = new ChatRequestToAdvisor(roomId, this.currentUser.id, id);

    this.chatService.startChatWithAdvisor(chatReq);
  }

  joinChatWithAdvisor(chatReq: ChatRequestToAdvisor) {
    //초대 받으면 초대 받은 방으로 입장
    const chatRoom = new ChatRoom(
      chatReq.roomId,
      [this.currentUser.id, chatReq.fromId],
      false
    );

    this.chatRoomList.push(chatRoom);

    const joinChatData = {
      roomId: chatReq.roomId,
      username: this.currentUser.name,
    };

    this.chatService.joinChatWithAdvisor(joinChatData);
  }

  joinChatWithCustomer(id: string) {
    const chatReq = this.requestedCustomerList.find((c) => c.id == id);

    //초대 받으면 초대 받은 방으로 입장
    const chatRoom = new ChatRoom(
      chatReq.roomId,
      [this.currentUser.id, chatReq.id],
      true
    );

    this.chatRoomList.push(chatRoom);

    const joinChatData = {
      roomId: chatReq.roomId,
      username: this.currentUser.name,
    };

    this.chatService.joinChatWithCustomer(joinChatData);
  }

  //대화에서 나가기
  exitChat(chatMsg: ChatMessage) {
    console.log(chatMsg);
    this.chatService.exitRoom(chatMsg as ChatMessage);

    const index = this.chatRoomList.findIndex(
      (cr) => cr.roomId === chatMsg.roomId
    );
    if (index !== -1) {
      this.chatRoomList.splice(index, 1);
    }
  }

  //다른 사람이 대화에서 나간 경우
  exitedChat(chatMsg: ChatMessage) {
    //TODO : 대화 참여자 목록을 관리해야 한다면 구현 추가
  }

  onChatWith(id: string): boolean {
    const chatRoom = this.chatRoomList.find((cr) => cr.hasMember(id));

    return chatRoom !== undefined;
  }

  cancelChat() {
    this.onRequestChat = false;
    if (this.onChat) {
      this.onChat = false;
    }
  }

  GetRoleTitle(roleId: number) {
    return roleDict.get(roleId);
  }

  GetStatusTitle(statusId: number) {
    return statusDict.get(statusId);
  }

  ngOnDestroy() {
    for (const sub of this.eventSubscriptions) {
      sub.unsubscribe();
    }
  }
}
