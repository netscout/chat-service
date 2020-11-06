/**
 * publish 메세지로 서버에 요청시 필요한 파라미터
 */
export class PublishData {
  //채팅룸id
  roomId: string;
  //사용자 id
  userId: string;
  //사용자이름
  username: string;
  //메세지 타입
  type: string;
  //사용자에게 보내는 메세지 여부
  toCustomer: boolean;
  //메세지 내용
  message: string;
  //채팅 요청 유저id
  fromId: string;
  //채팅 대상 유저id
  toId: string;

  constructor(
    type: string,
    roomId: string,
    userId: string,
    username: string,
    toCustomer: boolean,
    message: string
  ) {
    this.type = type;
    this.roomId = roomId;
    this.userId = userId;
    this.username = username;
    this.toCustomer = toCustomer;
    this.message = message;
  }
}
