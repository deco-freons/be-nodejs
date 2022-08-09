import BaseException from './base.exception';

class NotFoundException extends BaseException {
    constructor(message?: string) {
        super(404, `Not Found. ${message}`);
    }
}

export default NotFoundException;
