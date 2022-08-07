import BaseException from './base.exception';

class ForbiddenException extends BaseException {
    constructor() {
        super(403, 'Forbidden');
    }
}

export default ForbiddenException;
