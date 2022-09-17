import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';
import UserDTO from '../../auth/dto/user.dto';

interface ReadUserResponse<ResBody = ReadUserResponseBody, Locals = ReadUserResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface ReadUserResponseBody extends BaseResponseBody {
    user: Partial<UserDTO>;
}

interface ReadUserResponseLocals extends BaseLocals {}

export { ReadUserResponse, ReadUserResponseLocals };
