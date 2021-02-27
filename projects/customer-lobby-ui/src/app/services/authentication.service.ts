import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { User } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>

  //현재 로그인한 사용자의 정보 가져오기
  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  protected _readyState: BehaviorSubject<boolean> =
    new BehaviorSubject(false);

  constructor(
  ) {
    //브라우저의 로컬 스토리지에서 사용자 로그인 정보 확인
    this.currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem('currentUser'))
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  //로그인-------------------------------------------------------
  login(name: string) {
    let user = new User();
    user.name = name;

    //로그인 성공시 localStorage에 사용자 정보 저장
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    return user;
  }
}
