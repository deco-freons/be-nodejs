import { BaseRequest } from '../../common/request/base.request';
import EventUserDTO from '../dto/event.user.dto';

interface EventUserRequest extends BaseRequest<unknown, unknown, EventUserDTO, unknown, unknown> {}

export default EventUserRequest;
