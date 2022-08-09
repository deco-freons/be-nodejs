import LoginPayload from './login.payload';

interface RefreshTokenPayload extends LoginPayload {
    exp: number;
}

export default RefreshTokenPayload;
