import { Send } from 'express-serve-static-core';

import { BaseResponse, BaseResponseBody } from './base.response';

interface NotFoundResponseBody extends BaseResponseBody {
    method: string;
    path: string;
}

interface NotFoundResponse extends BaseResponse<NotFoundResponseBody> {}

export { NotFoundResponse, NotFoundResponseBody }
