import BaseException from './base.exception';

class MethodNotAllowedException extends BaseException {
    constructor(message?: string) {
        super(405, `Method Not Allowed. ${message}`);
    }
}

export default MethodNotAllowedException;
