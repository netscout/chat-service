import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ChatMessage } from '../models/chat-message';
import { ChatService } from "../services/chat.service";
import { AutoScrollableComponent } from '../shared/auto-scrollable.component';

@Component({
  selector: 'app-chat-ui',
  templateUrl: './chat-ui.component.html',
  styleUrls: ['./chat-ui.component.css']
})
export class ChatUiComponent
  extends AutoScrollableComponent
  implements OnInit, AfterViewInit {
  @ViewChild('scrollFrame', {static: false}) scrollFrame: ElementRef;
  @ViewChildren('message') messageElements: QueryList<any>;

  @Input() username: string;
  @Input() roomId: string;
  @Output() exitChat = new EventEmitter<ChatMessage>();
  newMessage: string = "";
  messageList: ChatMessage[] = [];

  constructor(private chatService: ChatService) {
    super();
  }

  ngOnInit(): void {
    this.chatService
      .newMessage$
      .subscribe((data: ChatMessage) => {
        console.log(data);
        //const message = JSON.parse(data) as ChatMessage;
        if(data.roomId == this.roomId) {
          this.messageList.push(data);
        }
      });

    this.chatService
      .joinedRoom$
      .subscribe((data: ChatMessage) => {
        if(data.roomId == this.roomId) {
          this.messageList.push(data);
        }
      });

    this.chatService
      .exitedRoom$
      .subscribe((data: ChatMessage) => {
        if(data.roomId == this.roomId) {
          this.messageList.push(data);
        }
      });
  }

  ngAfterViewInit() {
    this.initAutoScroll(this.scrollFrame.nativeElement);
    this.messageElements.changes.subscribe(_ => {
      this.onElementChanged();
    });
  }

  sendMessage() {
    console.log(this.newMessage);
    const newMessage = new ChatMessage(
      this.roomId,
      this.username,
      this.newMessage
    );
    this.chatService.sendMessage(newMessage);
    this.messageList.push(newMessage)
    this.newMessage = "";
  }

  exitRoom() {
    const message = new ChatMessage(
      this.roomId,
      this.username,
      ""
    );

    this.exitChat.emit(message);
  }
}
