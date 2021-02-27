import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from "./login/login.component"
import { ChatLobbyComponent } from "./chat-lobby/chat-lobby.component"

//URL에 따른 라우팅 규칙 정의
const routes: Routes = [
  {
    //localhost:4200/ 의 경우 MainComponent가 표시되도록
    path: '',
    component: LoginComponent,
    pathMatch: 'full'
  },
  {
    path: 'lobby',
    component: ChatLobbyComponent
  },

  // 규칙에 맞지 않는 URL의 경우 메인으로 이동
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
