import { BaseRequest } from '../../common/request/base.request';
import { ForgetPasswordCompleteDTO, ForgetPasswordDTO } from '../dto/forgetPassword.dto';

/**
 * @openapi
 * components:
 *  schemas:
 *    ForgetPasswordRequestRequest:
 *      tags:
 *      - /auth
 *      type: object
 *      required:
 *        - email
 *      properties:
 *        email:
 *          type: string
 *    ForgetPasswordRequest:
 *      type: object
 *      required:
 *        - userID
 *        - password
 *        - confirmPassword
 *        - token
 *      properties:
 *        userID:
 *          type: number
 *        password:
 *          type: string
 *        confirmPassword:
 *          type: string
 *        token:
 *          type: string
 */
interface ForgetPasswordRequestRequest extends BaseRequest<unknown, unknown, ForgetPasswordDTO, unknown, unknown> {}

interface ForgetPasswordRequest
    extends BaseRequest<unknown, unknown, ForgetPasswordCompleteDTO, unknown, unknown> {}

export { ForgetPasswordRequestRequest, ForgetPasswordRequest };
