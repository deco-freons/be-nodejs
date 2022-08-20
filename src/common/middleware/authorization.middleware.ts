import { NextFunction } from 'express';

import ExpiredTokenException from '../exception/expiredToken.exception';
import UnauthorizedException from '../exception/unauthorized.exception';
import JWT from '../utils/jwt';
import { BaseRequest } from '../request/base.request';
import { BaseResponse } from '../response/base.response';

const authorizationMiddleware = async (request: BaseRequest, response: BaseResponse, next: NextFunction) => {
    try {
        const token = request.headers.authorization;
        if (!token) throw new UnauthorizedException('Unable to make request to this endpoint.');

        const tokenResponse = JWT.verifyAccessToken(token);
        if (tokenResponse === null) throw new ExpiredTokenException();
        if (!tokenResponse.isVerified)
            throw new UnauthorizedException('Your account has not been verified yet, please verify first.');

        response.locals.username = tokenResponse.username;
        response.locals.email = tokenResponse.email;
        response.locals.isVerified = tokenResponse.isVerified;

        next();
    } catch (error) {
        return next(error);
    }
};

export default authorizationMiddleware;
