import BaseException from './base.exception';

/**
 * @openapi
 * components:
 *  schemas:
 *    ForbiddenResponse:
 *      type: object
 *      required:
 *        - statusCode
 *        - message
 *      properties:
 *        statusCode:
 *          type: number
 *          default: 403
 *        message:
 *          type: string
 *          default: Forbidden.
 */
class ForbiddenException extends BaseException {
    constructor(message?: string) {
        super(403, `Forbidden. ${message}`);
    }
}

export default ForbiddenException;
