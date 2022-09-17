import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';
import EventDetails from '../../event/entity/event.details.entity';

interface UserEventsResponse<ResBody = UserEventsResponseBody, Locals = UserEventsResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface UserEventsResponseBody extends BaseResponseBody {
    events: Partial<EventDetails>[];
}

interface UserEventsResponseLocals extends BaseLocals {}

export { UserEventsResponse, UserEventsResponseLocals };
