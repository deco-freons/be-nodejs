import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';

interface VerifyResponse<ResBody = VerifyResponseBody, Locals = VerifyResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface VerifyResponseBody extends BaseResponseBody {}

interface VerifyResponseLocals extends BaseLocals {}

export default VerifyResponse;
