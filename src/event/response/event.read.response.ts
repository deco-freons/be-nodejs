import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';
import EventDetails from '../entity/event.details';

interface ReadEventResponse<ResBody = ReadEventResponseBody, Locals = ReadEventResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface ReadEventResponseBody extends BaseResponseBody {
    events: Partial<EventDetails>[];
}

interface ReadEventResponseLocals extends BaseLocals {}

export default ReadEventResponse;
