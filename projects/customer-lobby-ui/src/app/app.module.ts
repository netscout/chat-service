import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { SocketIoModule, SocketIoConfig } from "ngx-socket-io";

import { AppComponent } from './app.component';
import { ChatUiComponent } from './chat-ui/chat-ui.component';
import { environment } from "@envs/environment";
import { ChatLobbyComponent } from './chat-lobby/chat-lobby.component';
import { LoginComponent } from './login/login.component';

const config: SocketIoConfig = {
  url: environment.baseUrl,
  options: { 
    autoConnect: false,
    withCredentials: true
  }
};

@NgModule({
  declarations: [
    AppComponent,
    ChatUiComponent,
    ChatLobbyComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    SocketIoModule.forRoot(config)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
