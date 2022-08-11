import { BaseRequest } from '../../common/request/base.request';
import RefreshTokenDTO from '../dto/refreshToken.dto';

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
interface RefreshTokenRequest extends BaseRequest<unknown, unknown, RefreshTokenDTO, unknown, unknown> {}

export default RefreshTokenRequest;
