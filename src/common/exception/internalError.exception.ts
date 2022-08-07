import BaseException from './base.exception';

class InternalServerErrorException extends BaseException {
    constructor(message?: string) {
        super(500, message ?? 'Internal Server Error');
    }
}

export default InternalServerErrorException;
