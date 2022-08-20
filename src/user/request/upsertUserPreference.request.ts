import { BaseRequest } from '../../common/request/base.request';
import UserPreferenceDTO from '../dto/user.preference.dto';

interface UpsertUserPreferenceRequest extends BaseRequest<unknown, unknown, UserPreferenceDTO, unknown, unknown> {}

export default UpsertUserPreferenceRequest;
