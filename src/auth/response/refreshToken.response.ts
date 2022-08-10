import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';

interface RefreshTokenResponseBody extends BaseResponseBody {
    accessToken: string;
    refreshToken: string;
}

interface RefreshTokenResponseLocals extends BaseLocals {}

interface RefreshTokenResponse<ResBody = RefreshTokenResponseBody, Locals = RefreshTokenResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

export default RefreshTokenResponse;
