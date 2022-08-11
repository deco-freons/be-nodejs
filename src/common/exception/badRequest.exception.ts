import BaseException from './base.exception';

/**
 * @openapi
 * components:
 *  schemas:
 *    BadRequestResponse:
 *      type: object
 *      required:
 *        - statusCode
 *        - message
 *      properties:
 *        statusCode:
 *          type: number
 *          default: 400
 *        message:
 *          type: string
 *          default: Bad Request.
 */
class BadRequestException extends BaseException {
    constructor(message?: string) {
        super(400, `Bad Request. ${message}`);
    }
}

export default BadRequestException;
