import { BaseRequest } from '../../common/request/base.request';
import UpdateUserDTO from '../dto/user.update.dto';

interface UpdateUserRequest extends BaseRequest<unknown, unknown, UpdateUserDTO, unknown, unknown> {}

export default UpdateUserRequest;
