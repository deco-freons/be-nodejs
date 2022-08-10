import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';

interface RegisterResponseBody extends BaseResponseBody {}

interface RegisterResponseLocals extends BaseLocals {}

interface RegisterResponse<ResBody = RegisterResponseBody, Locals = RegisterResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

export default RegisterResponse;
