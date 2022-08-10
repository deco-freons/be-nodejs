import UserPayload from './login.payload';

interface TokenPayload extends UserPayload {
    exp: number;
}

export default TokenPayload;
