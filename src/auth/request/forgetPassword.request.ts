import { BaseRequest } from '../../common/request/base.request';
import { ForgetPasswordCompleteDTO, ForgetPasswordDTO } from '../dto/forgetPassword.dto';

interface ForgetPasswordRequest extends BaseRequest<unknown, unknown, ForgetPasswordDTO, unknown, unknown> {}

interface ForgetPasswordCompleteRequest
    extends BaseRequest<unknown, unknown, ForgetPasswordCompleteDTO, unknown, unknown> {}

export { ForgetPasswordRequest, ForgetPasswordCompleteRequest };
