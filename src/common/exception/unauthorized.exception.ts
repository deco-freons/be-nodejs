import BaseException from './base.exception';

class UnauthorizedException extends BaseException {
    constructor(message?: string) {
        super(401, `Unauthorized. ${message}`);
    }
}

export default UnauthorizedException;
