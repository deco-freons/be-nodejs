import { BaseRequest } from '../../common/request/base.request';
import VerifyDTO from '../dto/verify.dto';

interface VerifyRequest extends BaseRequest<unknown, unknown, VerifyDTO, unknown, unknown> {}

export default VerifyRequest ;
