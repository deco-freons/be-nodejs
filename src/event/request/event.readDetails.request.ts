import { BaseRequest } from '../../common/request/base.request';
import ReadEventDetailsDTO from '../dto/event.readDetails.dto';

interface ReadEventDetailsRequest extends BaseRequest<unknown, unknown, ReadEventDetailsDTO, unknown, unknown> {}

export default ReadEventDetailsRequest;
