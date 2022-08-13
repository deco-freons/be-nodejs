import { NextFunction } from 'express';

import { BaseRequest } from '../request/base.request';
import { NotFoundResponse } from '../response/notFound.response';

async function notFoundMiddleware(request: BaseRequest, response: NotFoundResponse, _next: NextFunction) {
    const statusCode = 404;
    const message = 'Route Not Found';
    const path: string = request.path;
    const method: string = request.method;
    const requestTime: number = Math.floor(Date.now() / 1000);

    return response.status(statusCode).send({ statusCode, message, requestTime, path, method });
}

export default notFoundMiddleware;
