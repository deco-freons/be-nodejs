import BaseException from './base.exception';

class InternalServerErrorException extends BaseException {
    constructor(message?: string) {
        super(500, `Internal Server Error. ${message}`);
    }
}

export default InternalServerErrorException;
