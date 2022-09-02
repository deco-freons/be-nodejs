import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';
import UserDTO from '../dto/user.dto';

interface TokenResponse<ResBody = TokenResponseBody, Locals = TokenResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface TokenResponseBody extends BaseResponseBody {
    accessToken?: string;
    refreshToken?: string;
    isAuthenticated?: boolean;
    user?: Partial<UserDTO>;
}

interface TokenResponseLocals extends BaseLocals {
    email: string;
    username: string;
    isVerified: boolean;
}

export { TokenResponse, TokenResponseLocals };
