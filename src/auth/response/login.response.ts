import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';
import User from '../entity/user.entity';

interface LoginResponseBody extends BaseResponseBody {
    user: Partial<User>;
    accessToken: string;
    refreshToken: string;
}

interface LoginResponseLocals extends BaseLocals {}

interface LoginResponse<ResBody = LoginResponseBody, Locals = LoginResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

export default LoginResponse;
