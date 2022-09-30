import { BaseRequest, BaseRequestQuery } from '../../common/request/base.request';
import { SearchEventDTO } from '../dto/event.Search.dto';

interface SearchEventRequestQuery extends BaseRequestQuery {
    skip: string;
    take: string;
}

interface SearchEventRequest extends BaseRequest<unknown, unknown, SearchEventDTO, SearchEventRequestQuery, unknown> {}

export { SearchEventRequest, SearchEventRequestQuery };
