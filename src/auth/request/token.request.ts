import { BaseRequest } from '../../common/request/base.request';
import TokenDTO from '../dto/token.dto';

/**
 * @openapi
 * components:
 *  schemas:
 *    RefreshTokenRequest:
 *      type: object
 *      required:
 *        - refreshToken
 *      properties:
 *        refreshToken:
 *          type: string
 */
interface TokenRequest extends BaseRequest<unknown, unknown, TokenDTO, unknown, unknown> {}

export default TokenRequest;
