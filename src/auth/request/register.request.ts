import BaseRequest from '../../common/request/base.request';
import RegisterDTO from '../dto/register.dto';

interface RegisterRequest extends BaseRequest<unknown, unknown, RegisterDTO, unknown, unknown> {}

export default RegisterRequest;
