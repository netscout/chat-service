import { Component, OnInit } from '@angular/core';
import { Role } from "../models/role";
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

@Component({
  selector: 'app-chat-lobby',
  templateUrl: './chat-lobby.component.html',
  styleUrls: ['./chat-lobby.component.css']
})
export class ChatLobbyComponent implements OnInit {
  roles: Role[] = [
    {
      id: 1,
      title: '매니저'
    },
    {
      id: 2,
      title: '상담원'
    }
  ];
  currentUser: User;
  connectedAdvisorList = [];
  requestedCustomerList: CustomerChatRequest[] = [];
  chatRoomList: ChatRoom[] = [];
  connectedCustomerCount = 0;

  subject: string = "상담 요청 이유";
  onRequestChat: boolean = false;
  onChat: boolean = false;

  constructor(
    private lobbyService: LobbyService,
    private authService: AuthenticationService,
    // private chatService: ChatService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;

    this.lobbyService.connect({
      id: this.currentUser.id,
      username: this.currentUser.name,
      role: this.currentUser.roleId
    })

    this.lobbyService
      .getTotalConnectedAdvisorList()
      .subscribe((data: string) => {
        //console.log(data);
        this.connectedAdvisorList = JSON.parse(data);
      });

    this.lobbyService
      .advisorConnected()
      .subscribe((data: string) => {
        const connected = JSON.parse(data);
        //console.log(data);
        this.connectedAdvisorList.push(connected);
      });

    this.lobbyService
      .advisorDisconnected()
      .subscribe((data: string) => {
        const disconnected = JSON.parse(data);

        const index = this.connectedAdvisorList.findIndex(
          (ad) => ad.id === disconnected.id
        )
        if(index !== -1) {
          this.connectedAdvisorList.splice(index, 1)
        }
      });

    this.lobbyService
      .invitedChatWith()
      .subscribe((data) => {
        //초대 메세지를 받으면 채팅에 참가해야 한다.
        this.joinChatWithAdvisor(data as ChatRequestToAdvisor);
      });

    this.lobbyService
      .totalCustomerConnected()
      .subscribe((count:number) => {
        this.connectedCustomerCount = count;
      });

    this.lobbyService
      .customerChatRequest()
      .subscribe((chatReq: CustomerChatRequest) => {
        this.requestedCustomerList.push(
          chatReq
        );
      })

    this.lobbyService
      .customerCancelChatRequest()
      .subscribe((chatReq: CustomerChatRequest) => {
        const reqIdx =
          this.requestedCustomerList.findIndex(r => r.roomId == chatReq.roomId);
        this.requestedCustomerList.splice(reqIdx, 1);
      })

    this.lobbyService
      .customerDisconnected()
      .subscribe((id:string) => {
        //TODO: 고객의 id로 처리해야 할 게 있다면 추가
        if(this.connectedCustomerCount > 0) {
          this.connectedCustomerCount -= 1;
        }
      });

    this.lobbyService
      .joinChatSucceed()
      .subscribe((roomId: string) => {
        const reqIdx =
          this.requestedCustomerList.findIndex(r => r.roomId == roomId);
        this.requestedCustomerList.splice(reqIdx, 1);
      })
  }

  public get getRoleTitle(): string {
    const role = this.roles.find(r => r.id == this.currentUser.roleId);
    if(role)
    {
      return role.title;
    }

    return "미정";
  }

  startChatWithAdvisor(id: string) {
    //여기서 나는 방을 만들어서 입장하고, 그 방에 상대방도 입장시켜야 한다.
    const roomId = uuidv4();
    const chatRoom = new ChatRoom(
      roomId,
      [this.currentUser.id, id],
      false
    );
    this.chatRoomList.push(chatRoom);

    const chatReq = new ChatRequestToAdvisor(
      roomId,
      this.currentUser.id,
      id
    );

    this.lobbyService.startChatWithAdvisor(chatReq);
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
      username: this.currentUser.name
    }

    this.lobbyService.joinChatWithAdvisor(joinChatData);
  }

  joinChatWithCustomer(id: string) {
    const chatReq =
      this.requestedCustomerList.find(c => c.id == id);

    //초대 받으면 초대 받은 방으로 입장
    const chatRoom = new ChatRoom(
      chatReq.roomId,
      [this.currentUser.id, chatReq.id],
      true
    );

    this.chatRoomList.push(chatRoom);

    const joinChatData = {
      roomId: chatReq.roomId,
      username: this.currentUser.name
    }

    this.lobbyService.joinChatWithCustomer(joinChatData);
  }

  //대화에서 나가기
  exitChat(chatMsg: ChatMessage) {
    console.log(chatMsg);
    this.lobbyService.exitRoom(chatMsg as ChatMessage);

    const index = this.chatRoomList.findIndex(
      (cr) => cr.roomId === chatMsg.roomId
    )
    if(index !== -1) {
      this.chatRoomList.splice(index, 1)
    }
  }

  //다른 사람이 대화에서 나간 경우
  exitedChat(chatMsg: ChatMessage) {
    //TODO : 대화 참여자 목록을 관리해야 한다면 구현 추가
  }

  onChatWith(id: string): boolean {
    const chatRoom = this.chatRoomList.find(
      cr => cr.hasMember(id)
    );

    return chatRoom !== undefined;
  }

  cancelChat() {
    this.onRequestChat = false;
    if(this.onChat) {
      this.onChat = false;
    }
  }

  GetRoleTitle(roleId: number) {
    return roleDict.get(roleId);
  }

  GetStatusTitle(statusId: number) {
    return statusDict.get(statusId);
  }
}
