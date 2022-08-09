import jwt from 'jsonwebtoken';

import LoginPayload from '../../auth/payload/login.payload';
import { TokenTTL } from '../enum/token.enum';

const JWT = {
    signAccessToken : async (payload: LoginPayload) => {
        const secret = process.env.SIGN_ACCESS_TOKEN_PRIVATE || '';
        const options: jwt.SignOptions = {
            expiresIn: TokenTTL.ACCESS_TTL,
            algorithm: 'RS256',
        };

        return jwt.sign(payload, secret, options);
    },

    signRefreshToken : async (payload: LoginPayload) => {
        const secret = process.env.SIGN_REFRESH_TOKEN_PRIVATE || '';
        const options: jwt.SignOptions = {
            expiresIn: TokenTTL.REFRESH_TTL,
            algorithm: 'RS256',
        };

        return jwt.sign(payload, secret, options);
    }
}

export default JWT;
