import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';

/**
 * @openapi
 * components:
 *  schemas:
 *    RegisterResponse:
 *      type: object
 *      required:
 *        - statusCode
 *        - message
 *      properties:
 *        statusCode:
 *          type: number
 *          default: 201
 *        message:
 *          type: string
 *          default: User has been created. We have send you a verification link at your email address.
 */
interface RegisterResponse<ResBody = RegisterResponseBody, Locals = RegisterResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface RegisterResponseBody extends BaseResponseBody {}

interface RegisterResponseLocals extends BaseLocals {}

export default RegisterResponse;
