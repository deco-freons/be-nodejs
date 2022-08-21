import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';
import User from '../../auth/entity/user.entity';

interface ReadUserResponse<
    ResBody = ReadUserResponseBody,
    Locals = ReadUserResponseLocals,
> extends BaseResponse<ResBody, Locals> {}

interface ReadUserResponseBody extends BaseResponseBody {
    user: Partial<User>;
}

interface ReadUserResponseLocals extends BaseLocals {
    email: string;
    username: string;
    isVerified: string;
}

export { ReadUserResponse, ReadUserResponseLocals };
