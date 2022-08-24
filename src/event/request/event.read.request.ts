import { BaseRequest } from '../../common/request/base.request';
import ReadEventDTO from '../dto/event.read.dto';

interface ReadEventRequest extends BaseRequest<unknown, unknown, ReadEventDTO, unknown, unknown> {}

export default ReadEventRequest;
