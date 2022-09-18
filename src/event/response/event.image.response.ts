import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';

interface EventImageResponse<ResBody = EventImageResponseBody, Locals = EventImageResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface EventImageResponseBody extends BaseResponseBody {}

interface EventImageResponseLocals extends BaseLocals {}

export { EventImageResponse, EventImageResponseLocals };
