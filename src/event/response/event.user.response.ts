import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';

interface EventUserResponse<ResBody = EventUserResponseBody, Locals = EventUserResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface EventUserResponseBody extends BaseResponseBody {}

interface EventUserResponseLocals extends BaseLocals {}

export { EventUserResponse, EventUserResponseLocals };
