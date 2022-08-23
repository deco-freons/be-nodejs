import { NextFunction } from 'express';

import BaseException from '../exception/base.exception';
import { BaseRequest } from '../request/base.request';
import { BaseResponse } from '../response/base.response';

async function errorMiddleware(error: Error, _request: BaseRequest, response: BaseResponse, _next: NextFunction) {
    let statusCode = 500;
    let message = 'Internal Server Error';

    if (error instanceof BaseException) {
        statusCode = error.statusCode;
        message = error.message;
    }

    return response.status(statusCode).send({ statusCode, message });
}

export default errorMiddleware;
