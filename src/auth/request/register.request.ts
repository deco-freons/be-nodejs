import { BaseRequest } from '../../common/request/base.request';
import RegisterDTO from '../dto/register.dto';

/**
 * @openapi
 * components:
 *  schemas:
 *    RegisterRequest:
 *      type: object
 *      required:
 *        - username
 *        - firstName
 *        - lastName
 *        - email
 *        - password
 *        - confirmPassword
 *        - birthDate
 *      properties:
 *        username:
 *          type: string
 *        firstName:
 *          type: string
 *        lastName:
 *          type: string
 *        email:
 *          type: string
 *        password:
 *          type: string
 *        confirmPassword:
 *          type: string
 *        birthDate:
 *          type: date string
 *          example: '1990-01-01'
 */
interface RegisterRequest extends BaseRequest<unknown, unknown, RegisterDTO, unknown, unknown> {}

export default RegisterRequest;
