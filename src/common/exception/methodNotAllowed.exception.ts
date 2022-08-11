import BaseException from './base.exception';

/**
 * @openapi
 * components:
 *  schemas:
 *    MethodNotAllowedResponse:
 *      type: object
 *      required:
 *        - statusCode
 *        - message
 *      properties:
 *        statusCode:
 *          type: number
 *          default: 405
 *        message:
 *          type: string
 *          default: Method Not Allowed.
 */
class MethodNotAllowedException extends BaseException {
    constructor(message?: string) {
        super(405, `Method Not Allowed. ${message}`);
    }
}

export default MethodNotAllowedException;
