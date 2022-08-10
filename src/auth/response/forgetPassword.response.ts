import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';

interface ForgetPasswordResponseBody extends BaseResponseBody {}

interface ForgetPasswordResponseLocals extends BaseLocals {}

interface ForgetPasswordResponse<ResBody = ForgetPasswordResponseBody, Locals = ForgetPasswordResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface ForgetPasswordCompleteResponseBody extends BaseResponseBody {}

interface ForgetPasswordCompleteResponseLocals extends BaseLocals {}

interface ForgetPasswordCompleteResponse<
    ResBody = ForgetPasswordCompleteResponseBody,
    Locals = ForgetPasswordCompleteResponseLocals,
> extends BaseResponse<ResBody, Locals> {}

export { ForgetPasswordResponse, ForgetPasswordCompleteResponse };
