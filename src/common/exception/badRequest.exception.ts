import BaseException from './base.exception';

class BadRequestException extends BaseException {
    constructor(message?: string) {
        super(400, `Bad Request. ${message}`);
    }
}

export default BadRequestException;
