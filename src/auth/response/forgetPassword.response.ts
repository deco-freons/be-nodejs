import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';

/**
 * @openapi
 * components:
 *  schemas:
 *    ForgetPasswordRequestResponse:
 *      type: object
 *      required:
 *        - statusCode
 *        - message
 *      properties:
 *        statusCode:
 *          type: number
 *          default: 200
 *        message:
 *          type: string
 *          default: If your email address exists in our database, you will receive a password recovery link at your email address.
 */
interface ForgetPasswordRequestResponse<
    ResBody = ForgetPasswordRequestResponseBody,
    Locals = ForgetPasswordRequestResponseLocals,
> extends BaseResponse<ResBody, Locals> {}

interface ForgetPasswordRequestResponseBody extends BaseResponseBody {}

interface ForgetPasswordRequestResponseLocals extends BaseLocals {}

/**
 * @openapi
 * components:
 *  schemas:
 *    ForgetPasswordResponse:
 *      type: object
 *      required:
 *        - statusCode
 *        - message
 *      properties:
 *        statusCode:
 *          type: number
 *          default: 200
 *        message:
 *          type: string
 *          default: You have successfully change your password.
 */
interface ForgetPasswordResponse<ResBody = ForgetPasswordResponseBody, Locals = ForgetPasswordResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface ForgetPasswordResponseBody extends BaseResponseBody {}

interface ForgetPasswordResponseLocals extends BaseLocals {}

export { ForgetPasswordRequestResponse, ForgetPasswordResponse };
