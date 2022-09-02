import { BaseRequest } from '../../common/request/base.request';
import TokenDTO from '../dto/token.dto';

interface TokenRequest extends BaseRequest<unknown, unknown, TokenDTO, unknown, unknown> {}

export default TokenRequest;
