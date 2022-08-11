import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';

/**
 * @openapi
 * components:
 *  schemas:
 *    RefreshTokenResponse:
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
interface RefreshTokenResponse<ResBody = RefreshTokenResponseBody, Locals = RefreshTokenResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface RefreshTokenResponseBody extends BaseResponseBody {
    accessToken: string;
    refreshToken: string;
}

interface RefreshTokenResponseLocals extends BaseLocals {}

export default RefreshTokenResponse;
