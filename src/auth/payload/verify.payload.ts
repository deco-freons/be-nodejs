import BasePayload from '../../common/payload/base.payload';

interface VerifyPayload extends BasePayload {
    userID: string;
    username: string;
    email: string;
}

export default VerifyPayload;
