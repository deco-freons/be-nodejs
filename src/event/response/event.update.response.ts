import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';

interface UpdateEventResponse<ResBody = UpdateEventResponseBody, Locals = UpdateEventResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface UpdateEventResponseBody extends BaseResponseBody {}

interface UpdateEventResponseLocals extends BaseLocals {}

export default UpdateEventResponse;
