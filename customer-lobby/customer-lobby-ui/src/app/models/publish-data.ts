/**
 * publish 메세지로 서버에 요청시 필요한 파라미터
 */
export type PublishData<T> = T & {
  //메세지 타입
  type: string;
}
