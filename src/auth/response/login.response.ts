import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';
import UserDTO from '../dto/user.dto';

/**
 * @openapi
 * components:
 *  schemas:
 *    LoginResponse:
 *      type: object
 *      required:
 *        - statusCode
 *        - message
 *        - user
 *        - accessToken
 *        - refreshToken
 *      properties:
 *        statusCode:
 *          type: number
 *          default: 200
 *        message:
 *          type: string
 *          default: Login successful.
 *        user:
 *          $ref: '#/components/schemas/User'
 *        accessToken:
 *          type: string
 *        refreshToken:
 *          type: string
 */
interface LoginResponse<ResBody = LoginResponseBody, Locals = LoginResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface LoginResponseBody extends BaseResponseBody {
    user: UserDTO;
    accessToken: string;
    refreshToken: string;
}

interface LoginResponseLocals extends BaseLocals {}

export default LoginResponse;
