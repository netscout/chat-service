import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChatMessage } from '../models/chat-message';
import { ChatRoom } from '../models/chat-room';
import { User } from '../models/user';
import { ChatService } from "../services/chat.service";
import { AutoScrollableComponent } from '../shared/auto-scrollable.component';

@Component({
  selector: 'app-chat-ui',
  templateUrl: './chat-ui.component.html',
  styleUrls: ['./chat-ui.component.css']
})
export class ChatUiComponent
  extends AutoScrollableComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollFrame', {static: false}) scrollFrame: ElementRef;
  @ViewChildren('message') messageElements: QueryList<any>;

  @Input() userInfo: User;
  @Input() roomInfo: ChatRoom;
  @Input() withCustomer: boolean;
  @Output() exitChat = new EventEmitter<ChatMessage>();

  private eventSubscriptions: Subscription[] = [];

  newMessage: string = "";
  messageList: ChatMessage[] = [];
  chatWithCustomer: boolean = false;

  constructor(private chatService: ChatService) {
    super();
  }

  ngOnInit(): void {
    this.eventSubscriptions.push(
    this.chatService
      .newMessage$
      .subscribe((data: ChatMessage) => {
        console.log('info',data);
        if(data.roomId == this.roomInfo.roomId) {
          this.messageList.push(data);
        }
      })
    );

    this.eventSubscriptions.push(
    this.chatService
      .joinedRoom$
      .subscribe((data: ChatMessage) => {
        if(data.roomId == this.roomInfo.roomId) {
          this.messageList.push(data);
        }
      })
    );

    this.eventSubscriptions.push(
    this.chatService
      .exitedRoom$
      .subscribe((data: ChatMessage) => {
        if(data.roomId == this.roomInfo.roomId) {
          this.messageList.push(data);
        }
      })
    );

    this.eventSubscriptions.push(
    this.chatService
      .customerExited$
      .subscribe((chatMsg: ChatMessage) => {
        if(chatMsg.roomId == this.roomInfo.roomId) {
          this.messageList.push(chatMsg);
        }
      })
    );
  }

  ngAfterViewInit() {
    this.initAutoScroll(this.scrollFrame.nativeElement);
    this.messageElements.changes.subscribe(_ => {
      this.onElementChanged();
    });
  }

  sendMessage() {
    console.log('info',this.newMessage);
    const newMessage = new ChatMessage(
      this.roomInfo.roomId,
      this.userInfo.id,
      this.userInfo.name,
      this.newMessage,
      this.roomInfo.withCustomer
    );
    this.chatService.sendMessage(newMessage);
    this.messageList.push(newMessage)
    this.newMessage = "";
  }

  exitRoom() {
    const message = new ChatMessage(
      this.roomInfo.roomId,
      this.userInfo.id,
      this.userInfo.name,
      "",
      this.roomInfo.withCustomer
    );

    this.exitChat.emit(message);
  }

  ngOnDestroy() {
    for(const sub of this.eventSubscriptions) {
      sub.unsubscribe();
    }
  }
}
