import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';

interface CreateEventResponse<
    ResBody = CreateEventResponseBody,
    Locals = CreateEventResponseLocals,
> extends BaseResponse<ResBody, Locals> {}

interface CreateEventResponseBody extends BaseResponseBody {}

interface CreateEventResponseLocals extends BaseLocals {
    email: string;
    username: string;
    isVerified: string;
}

export { CreateEventResponse, CreateEventResponseLocals };
