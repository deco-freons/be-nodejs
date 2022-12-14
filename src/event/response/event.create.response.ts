import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';

interface CreateEventResponse<ResBody = CreateEventResponseBody, Locals = CreateEventResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface CreateEventResponseBody extends BaseResponseBody {
    eventID: number;
}

interface CreateEventResponseLocals extends BaseLocals {}

export { CreateEventResponse, CreateEventResponseLocals };
