import BaseException from './base.exception';

/**
 * @openapi
 * components:
 *  schemas:
 *    ExpiredTokenResponse:
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
 *          default: Token Expired.
 */
class ExpiredTokenException extends BaseException {
    constructor(message?: string) {
        super(401, `Token Expired. ${message}`);
    }
}

export default ExpiredTokenException;
