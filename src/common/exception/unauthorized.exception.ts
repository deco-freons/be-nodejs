import BaseException from './base.exception';

class UnauthorizedException extends BaseException {
    constructor() {
        super(401, 'Unauthorized');
    }
}

export default UnauthorizedException;
