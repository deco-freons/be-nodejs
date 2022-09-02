import { BaseRequest } from '../../common/request/base.request';
import UserOtherDTO from '../dto/user.others.dto';

interface ReadOtherUserRequest extends BaseRequest<unknown, unknown, UserOtherDTO, unknown, unknown> {}

export default ReadOtherUserRequest;
