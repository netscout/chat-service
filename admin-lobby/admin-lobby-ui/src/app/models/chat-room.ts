export class ChatRoom {
  roomId: string;
  members: string[];
  withCustomer: boolean;

  constructor(
    roomId:string,
    members:string[],
    withCustomer: boolean) {
    this.roomId = roomId;
    this.members = members;
    this.withCustomer = withCustomer;
  }

  hasMember(memberId: string): boolean {
    return this.members.includes(memberId);
  }
}
