import { IncomingHttpHeaders } from 'http';
import { Request } from 'express';

interface BaseRequest extends Request {
    headers: IncomingHttpHeaders & {
        customHeader?: string;
    };
}

export default BaseRequest;
