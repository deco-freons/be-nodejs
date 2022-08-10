import BaseException from './base.exception';

class ExpiredTokenException extends BaseException {
    constructor(message?: string) {
        super(401, `Token Expired. ${message}`);
    }
}

export default ExpiredTokenException;
