import BaseException from './base.exception';

/**
 * @openapi
 * components:
 *  schemas:
 *    InternalServerErrorResponse:
 *      type: object
 *      required:
 *        - statusCode
 *        - message
 *      properties:
 *        statusCode:
 *          type: number
 *          default: 500
 *        message:
 *          type: string
 *          default: Internal Server Error.
 */
class InternalServerErrorException extends BaseException {
    constructor(message?: string) {
        super(500, message ?? 'Internal Server Error');
    }
}

export default InternalServerErrorException;
