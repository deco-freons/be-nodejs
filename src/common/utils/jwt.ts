import jwt from 'jsonwebtoken';

import Crypt from './crypt';
import UserPayload from '../../auth/payload/login.payload';
import TokenPayload from '../../auth/payload/token.payload';
import ExpiredTokenException from '../exception/expiredToken.exception';
import UnauthorizedException from '../exception/unauthorized.exception';
import { TTL } from '../enum/token.enum';

const JWT = {
    signAccessToken: (payload: UserPayload) => {
        const secret = process.env.SIGN_ACCESS_TOKEN_PRIVATE || '';
        const options: jwt.SignOptions = {
            expiresIn: TTL.ACCESS_TOKEN_TTL,
            algorithm: 'RS256',
        };

        return jwt.sign(payload, secret, options);
    },

    verifyAccessToken: (token: string): TokenPayload => {
        try {
            const secret = process.env.SIGN_ACCESS_TOKEN_PUBLIC || '';
            return jwt.verify(token, secret) as TokenPayload;
        } catch (error) {
            throw new UnauthorizedException('Invalid Token.');
        }
    },

    signRefreshToken: (payload: UserPayload) => {
        const secret = process.env.SIGN_REFRESH_TOKEN_PRIVATE || '';
        const options: jwt.SignOptions = {
            expiresIn: TTL.REFRESH_TOKEN_TTL,
            algorithm: 'RS256',
        };

        return jwt.sign(payload, secret, options);
    },

    verifyRefreshToken: (token: string): TokenPayload => {
        try {
            const secret = process.env.SIGN_REFRESH_TOKEN_PUBLIC || '';
            return jwt.verify(token, secret) as TokenPayload;
        } catch (error) {
            throw new UnauthorizedException('Invalid Token.');
        }
    },

    signToken: async (payload: UserPayload, endpoint: string) => {
        const secret = await Crypt.salt();
        const options: jwt.SignOptions = {
            expiresIn: endpoint == 'verify' ? TTL.VERIFY_TTL : TTL.FORGET_PASSWORD_TTL,
        };
        const token = jwt.sign(payload, secret, options);
        return { token, secret };
    },

    verifyToken: (token: string, secret: string): TokenPayload => {
        try {
            return jwt.verify(token, secret) as TokenPayload;
        } catch (error) {
            throw new ExpiredTokenException('Please request a new verification email.');
        }
    },
};

export default JWT;
