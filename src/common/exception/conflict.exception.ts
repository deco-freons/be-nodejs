import BaseException from './base.exception';

class ConflictException extends BaseException {
    constructor(message?: string) {
        super(409, `Conflict. ${message}`);
    }
}

export default ConflictException;
