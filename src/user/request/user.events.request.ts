import { BaseRequest } from '../../common/request/base.request';
import UserLongLatDTO from '../dto/user.longlat.dto';

interface UserEventsRequest extends BaseRequest<unknown, unknown, UserLongLatDTO, unknown, unknown> {}

export default UserEventsRequest;
