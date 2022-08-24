import { BaseRequest, BaseRequestQuery } from '../../common/request/base.request';
import { ReadEventDTO } from '../dto/event.read.dto';

interface ReadEventRequestQuery extends BaseRequestQuery {
    skip: string;
    take: string;
}

interface ReadEventRequest extends BaseRequest<unknown, unknown, ReadEventDTO, ReadEventRequestQuery, unknown> {}

export { ReadEventRequest, ReadEventRequestQuery };
