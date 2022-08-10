import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';

interface VerifyResponseBody extends BaseResponseBody {}

interface VerifyResponseLocals extends BaseLocals {}

interface VerifyResponse<ResBody = VerifyResponseBody, Locals = VerifyResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

export { VerifyResponse, VerifyResponseBody, VerifyResponseLocals };
