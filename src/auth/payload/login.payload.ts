import BasePayload from '../../common/payload/base.payload';

interface LoginPayload extends BasePayload {
    username: string;
    email: string;
}

export default LoginPayload;
