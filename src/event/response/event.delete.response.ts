import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';

interface DeleteEventResponse<ResBody = DeleteEventResponseBody, Locals = DeleteEventResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface DeleteEventResponseBody extends BaseResponseBody {}

interface DeleteEventResponseLocals extends BaseLocals {}

export { DeleteEventResponse, DeleteEventResponseLocals };
