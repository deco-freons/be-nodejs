import { BaseRequest } from '../../common/request/base.request';
import DeleteEventDTO from '../dto/event.delete.dto';

interface DeleteEventRequest extends BaseRequest<unknown, unknown, DeleteEventDTO, unknown, unknown> {}

export default DeleteEventRequest;
