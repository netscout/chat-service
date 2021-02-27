import { PublishData } from './publish-data';

/**
 * publish요청에 대한 결과 값
 */
export class ResponseData {
  req: any;
  succeed: boolean;

  constructor(
    req: any,
    succeed: boolean
  ) {
    this.req = req;
    this.succeed = succeed;
  }
}
