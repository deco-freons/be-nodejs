import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';
import UserDTO from '../dto/user.dto';

interface LoginResponse<ResBody = LoginResponseBody, Locals = LoginResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface LoginResponseBody extends BaseResponseBody {
    user: Partial<UserDTO>;
    accessToken: string;
    refreshToken: string;
}

interface LoginResponseLocals extends BaseLocals {}

export default LoginResponse;
