import { BaseRequest } from '../../common/request/base.request';
import CreateEventDTO from '../dto/event.create.dto';

interface CreateEventRequest extends BaseRequest<unknown, unknown, CreateEventDTO, unknown, unknown> {}

export default CreateEventRequest;
