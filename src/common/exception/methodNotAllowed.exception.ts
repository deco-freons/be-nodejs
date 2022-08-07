import BaseException from './base.exception';

class MethodNotAllowedException extends BaseException {
    constructor() {
        super(405, 'Method Not Allowed');
    }
}

export default MethodNotAllowedException;
