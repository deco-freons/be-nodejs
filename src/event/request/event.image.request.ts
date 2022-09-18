import { BaseRequest } from '../../common/request/base.request';
import UploadEventImageDTO from '../dto/event.image.dto';

interface UploadEventImageRequest extends BaseRequest<unknown, unknown, UploadEventImageDTO, unknown, unknown> {}

export default UploadEventImageRequest;
