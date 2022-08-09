import LoginPayload from './login.payload';

interface AccessTokenPayload extends LoginPayload {
    exp: number;
}

export default AccessTokenPayload;
