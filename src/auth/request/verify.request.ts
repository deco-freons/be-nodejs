import { BaseRequest } from '../../common/request/base.request';
import VerifyDTO from '../dto/verify.dto';

/**
 * @openapi
 * components:
 *  schemas:
 *    VerifyRequest:
 *      type: object
 *      required:
 *        - userID
 *        - token
 *      properties:
 *        userID:
 *          type: number
 *        token:
 *          type: string
 */
interface VerifyRequest extends BaseRequest<unknown, unknown, VerifyDTO, unknown, unknown> {}

export default VerifyRequest ;
