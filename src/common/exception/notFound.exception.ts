import BaseException from './base.exception';

/**
 * @openapi
 * components:
 *  schemas:
 *    NotFoundResponse:
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
 *          default: Not Found.
 */
class NotFoundException extends BaseException {
    constructor(message?: string) {
        super(404, `Not Found. ${message}`);
    }
}

export default NotFoundException;
