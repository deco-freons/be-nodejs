import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';
import UserDTO from '../../auth/dto/user.dto';

interface ReadUserResponse<
    ResBody = ReadUserResponseBody,
    Locals = ReadUserResponseLocals,
> extends BaseResponse<ResBody, Locals> {}

interface ReadUserResponseBody extends BaseResponseBody {
    user: UserDTO;
}

interface ReadUserResponseLocals extends BaseLocals {
    email: string;
    username: string;
    isVerified: string;
}

export { ReadUserResponse, ReadUserResponseLocals };
