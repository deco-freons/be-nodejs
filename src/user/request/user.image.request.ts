import { BaseRequest } from '../../common/request/base.request';
import UserImageDTO from '../dto/user.image.dto';

interface UserImageRequest extends BaseRequest<unknown, unknown, UserImageDTO, unknown, unknown> {}

export default UserImageRequest;
