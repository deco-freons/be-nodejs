import BaseException from './base.exception';

class NotFoundException extends BaseException {
    constructor() {
        super(404, 'Not Found');
    }
}

export default NotFoundException;
