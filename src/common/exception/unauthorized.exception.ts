import BaseException from './base.exception';

/**
 * @openapi
 * components:
 *  schemas:
 *    UnauthorizedResponse:
 *      type: object
 *      required:
 *        - statusCode
 *        - message
 *      properties:
 *        statusCode:
 *          type: number
 *          default: 401
 *        message:
 *          type: string
 *          default: Unauthorized.
 */
class UnauthorizedException extends BaseException {
    constructor(message?: string) {
        super(401, `Unauthorized. ${message}`);
    }
}

export default UnauthorizedException;
