import { PublishData } from './publish-data';

/**
 * publish요청에 대한 결과 값
 */
export class ResponseData {
  req: PublishData;
  succeed: boolean;

  constructor(
    req: PublishData,
    succeed: boolean
  ) {
    this.req = req;
    this.succeed = succeed;
  }
}
