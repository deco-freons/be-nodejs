import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';

interface ForgetPasswordRequestResponse<
    ResBody = ForgetPasswordRequestResponseBody,
    Locals = ForgetPasswordRequestResponseLocals,
> extends BaseResponse<ResBody, Locals> {}

interface ForgetPasswordRequestResponseBody extends BaseResponseBody {}

interface ForgetPasswordRequestResponseLocals extends BaseLocals {}

interface ForgetPasswordResponse<ResBody = ForgetPasswordResponseBody, Locals = ForgetPasswordResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface ForgetPasswordResponseBody extends BaseResponseBody {}

interface ForgetPasswordResponseLocals extends BaseLocals {}

export { ForgetPasswordRequestResponse, ForgetPasswordResponse };
