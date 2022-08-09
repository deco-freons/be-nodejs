import jwt from 'jsonwebtoken';

import LoginPayload from '../../auth/payload/login.payload';
import AccessTokenPayload from '../../auth/payload/accessToken.payload';
import RefreshTokenPayload from '../../auth/payload/refreshToken.payload';
import UnauthorizedException from '../exception/unauthorized.exception';
import { TokenTTL } from '../enum/token.enum';

const JWT = {
    signAccessToken: (payload: LoginPayload) => {
        const secret = process.env.SIGN_ACCESS_TOKEN_PRIVATE || '';
        const options: jwt.SignOptions = {
            expiresIn: TokenTTL.ACCESS_TOKEN_TTL,
            algorithm: 'RS256',
        };

        return jwt.sign(payload, secret, options);
    },

    verifyAccessToken: (token: string): AccessTokenPayload => {
        const secret = process.env.SIGN_ACCESS_TOKEN_PUBLIC || '';
        return jwt.verify(token, secret) as AccessTokenPayload;
    },

    signRefreshToken: (payload: LoginPayload) => {
        const secret = process.env.SIGN_REFRESH_TOKEN_PRIVATE || '';
        const options: jwt.SignOptions = {
            expiresIn: TokenTTL.REFRESH_TOKEN_TTL,
            algorithm: 'RS256',
        };

        return jwt.sign(payload, secret, options);
    },

    verifyRefreshToken: (token: string): RefreshTokenPayload => {
        try {
            const secret = process.env.SIGN_REFRESH_TOKEN_PUBLIC || '';
            return jwt.verify(token, secret) as RefreshTokenPayload;
        } catch (error) {
            throw new UnauthorizedException('Invalid Token');
        }
    },
};

export default JWT;
