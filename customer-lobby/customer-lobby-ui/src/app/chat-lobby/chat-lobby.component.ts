import { Component, OnInit } from '@angular/core';
import { LobbyService } from '../services/lobby.service';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticationService } from '../services/authentication.service';
import { CustomerChatRequest } from '../models/customer-chat-request';
import { ChatMessage } from '../models/chat-message';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-chat-lobby',
  templateUrl: './chat-lobby.component.html',
  styleUrls: ['./chat-lobby.component.css']
})
export class ChatLobbyComponent implements OnInit {
  username: string = "고객";
  subject: string = "상담 요청 이유";
  onRequestChat: boolean = false;
  onChat: boolean = false;
  currentId:string;
  currentRoomId: string;

  constructor(
    private lobbyService: LobbyService,
    private authService: AuthenticationService) { }

  ngOnInit(): void {
    this.username = this.authService.currentUserValue.name;

    const id = uuidv4();
    this.currentId = id;
    this.lobbyService.connect({
      id: id,
      username: this.username
    });

    this.lobbyService
      .requestAccepted()
      .subscribe((data: ChatMessage) => {
        if(this.onRequestChat) {
          this.onChat = true;
          this.onRequestChat = false;
        }
      });
  }

  requestChat() {
    if(!this.currentRoomId) {
      this.currentRoomId = uuidv4();
    }

    const chatReq = new CustomerChatRequest(
      this.currentId,
      this.username,
      this.subject,
      this.currentRoomId
    );

    this.lobbyService.requestChat(chatReq);

    this.onRequestChat = true;
  }

  cancelChat() {
    this.onRequestChat = false;
    if(this.onChat) {
      this.onChat = false;
    }

    const chatReq = new CustomerChatRequest(
      this.currentId,
      this.username,
      this.subject,
      this.currentRoomId
    );

    this.lobbyService.cancelChat(chatReq);
  }

  //대화에서 나가기
  exitChat(chatMsg: ChatMessage) {
    this.onChat = false;

    this.lobbyService.exitRoom(chatMsg as ChatMessage);
  }
}
