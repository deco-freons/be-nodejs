import { BaseRequest, BaseRequestQuery } from '../../common/request/base.request';
import VerifyDTO from '../dto/verify.dto';

interface VerifyQuery extends BaseRequestQuery {
    token: string;
    userID: string;
}

interface VerifyRequest extends BaseRequest<unknown, unknown, VerifyDTO, VerifyQuery, unknown> {}

export { VerifyRequest, VerifyQuery };
