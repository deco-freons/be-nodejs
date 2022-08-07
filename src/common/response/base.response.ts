/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express';

interface BaseResponseBody {
    statusCode: number;
    message: string;
    requestTime?: number;
}

interface BaseLocals extends Record<string, any> {}

interface BaseResponse<ResBody = BaseResponseBody, Locals = BaseLocals> extends Response<ResBody, Locals> {}

export { BaseResponse, BaseResponseBody, BaseLocals };
