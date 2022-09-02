import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';

interface RegisterResponse<ResBody = RegisterResponseBody, Locals = RegisterResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface RegisterResponseBody extends BaseResponseBody {}

interface RegisterResponseLocals extends BaseLocals {}

export default RegisterResponse;
