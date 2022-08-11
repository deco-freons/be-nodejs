import { BaseRequest } from '../../common/request/base.request';
import LoginDTO from '../dto/login.dto';

/**
 * @openapi
 * components:
 *  schemas:
 *    LoginRequest:
 *      type: object
 *      required:
 *        - username
 *        - password
 *      properties:
 *        username:
 *          type: string
 *        password:
 *          type: string
 */
interface LoginRequest extends BaseRequest<unknown, unknown, LoginDTO, unknown, unknown> {}

export default LoginRequest;
