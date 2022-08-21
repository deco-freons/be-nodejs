import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';
import User from '../../auth/entity/user.entity';

interface UpdateUserResponse<
    ResBody = UpdateUserResponseBody,
    Locals = UpdateUserResponseLocals,
> extends BaseResponse<ResBody, Locals> {}

interface UpdateUserResponseBody extends BaseResponseBody {
    user: Partial<User>;
}

interface UpdateUserResponseLocals extends BaseLocals {
    email: string;
    username: string;
    isVerified: string;
}

export { UpdateUserResponse, UpdateUserResponseLocals };
