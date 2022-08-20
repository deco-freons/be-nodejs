import BasePayload from '../../common/payload/base.payload';

interface UserPayload extends BasePayload {
    username: string;
    email: string;
    isVerified: boolean;
}

export default UserPayload;
