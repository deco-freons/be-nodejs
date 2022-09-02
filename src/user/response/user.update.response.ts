import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';
import UserDTO from '../../auth/dto/user.dto';

interface UpdateUserResponse<
    ResBody = UpdateUserResponseBody,
    Locals = UpdateUserResponseLocals,
> extends BaseResponse<ResBody, Locals> {}

interface UpdateUserResponseBody extends BaseResponseBody {
    user: Partial<UserDTO>;
}

interface UpdateUserResponseLocals extends BaseLocals {
    email: string;
    username: string;
    isVerified: string;
}

export { UpdateUserResponse, UpdateUserResponseLocals };
