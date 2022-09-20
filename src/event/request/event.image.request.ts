import { BaseRequest } from '../../common/request/base.request';
import EventImageDTO from '../dto/event.image.dto';

interface EventImageRequest extends BaseRequest<unknown, unknown, EventImageDTO, unknown, unknown> {}

export default EventImageRequest;
