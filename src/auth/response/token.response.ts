import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';
import User from '../entity/user.entity';

/**
 * @openapi
 * components:
 *  schemas:
 *    TokenResponse:
 *      type: object
 *      required:
 *        - statusCode
 *        - message
 *        - accessToken
 *        - refreshToken
 *      properties:
 *        statusCode:
 *          type: number
 *          default: 200
 *        message:
 *          type: string
 *          default: Success.
 *        accessToken:
 *          type: string
 *        refreshToken:
 *          type: string
 */
interface TokenResponse<ResBody = TokenResponseBody, Locals = TokenResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface TokenResponseBody extends BaseResponseBody {
    accessToken?: string;
    refreshToken?: string;
    isLogin?: boolean;
    user?: Partial<User>;
}

interface TokenResponseLocals extends BaseLocals {
    email: string;
    username: string;
    isVerified: boolean;
}

export { TokenResponse, TokenResponseLocals };