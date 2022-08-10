import LoginPayload from './login.payload';

interface TokenPayload extends LoginPayload {
    exp: number;
}

export default TokenPayload;
