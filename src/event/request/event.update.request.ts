import { BaseRequest } from '../../common/request/base.request';
import UpdateEventDTO from '../dto/event.update.dto';

interface UpdateEventRequest extends BaseRequest<unknown, unknown, UpdateEventDTO, unknown, unknown> {}

export default UpdateEventRequest;
