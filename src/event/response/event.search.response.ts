import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';
import EventDetails from '../entity/event.details.entity';

interface SearchEventResponse<ResBody = SearchEventResponseBody, Locals = SearchEventResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface SearchEventResponseBody extends BaseResponseBody {
    events: Partial<EventDetails>[];
}

interface SearchEventResponseLocals extends BaseLocals {}

export { SearchEventResponse, SearchEventResponseLocals };
