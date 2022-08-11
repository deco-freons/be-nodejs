import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';

/**
 * @openapi
 * components:
 *  schemas:
 *    VerifyResponse:
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
 *          default: Your account has been verified.
 */
interface VerifyResponse<ResBody = VerifyResponseBody, Locals = VerifyResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface VerifyResponseBody extends BaseResponseBody {}

interface VerifyResponseLocals extends BaseLocals {}

export default VerifyResponse;
