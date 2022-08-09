import BaseRequest from '../../common/request/base.request';
import RefreshTokenDTO from '../dto/refreshToken.dto';

interface RefreshTokenRequest extends BaseRequest<unknown, unknown, RefreshTokenDTO, unknown, unknown> {}

export default RefreshTokenRequest;