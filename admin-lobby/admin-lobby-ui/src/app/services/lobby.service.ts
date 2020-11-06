import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChatData } from '../models/chat-data';
import { ChatMessage } from "../models/chat-message";
import { ChatRequestToAdvisor } from '../models/chat-request-to-advisor';
import { PublishData } from '../models/publish-data';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {
  constructor(private socket: Socket) {

  }
}
