import { Response } from 'express';
import { Send } from 'express-serve-static-core';

interface BaseResponseBody {
    statusCode: number;
    message: string;
    requestTime?: number;
}

interface BaseResponse<ResBody = BaseResponseBody, Locals extends Record<string, any> = Record<string, any>>
    extends Response<ResBody, Locals> {}

export { BaseResponse, BaseResponseBody };
