import BaseRequest from '../../common/request/base.request';
import LoginDTO from '../dto/login.dto';

interface LoginRequest extends BaseRequest<unknown, unknown, LoginDTO, unknown, unknown> {}

export default LoginRequest;