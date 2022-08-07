import { Request } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';

import { BaseResponseBody, BaseLocals } from '../response/base.response';

interface BaseRequestBody {}

interface BaseRequest<
    P = ParamsDictionary,
    ResBody = BaseResponseBody,
    ReqBody = BaseRequestBody,
    ReqQuery = Query,
    Locals = BaseLocals,
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {}

export default BaseRequest;
