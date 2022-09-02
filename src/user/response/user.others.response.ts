import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';
import UserDTO from '../../auth/dto/user.dto';

interface ReadOtherUserResponse<ResBody = ReadOtherUserResponseBody, Locals = ReadOtherUserResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface ReadOtherUserResponseBody extends BaseResponseBody {
    user: Partial<UserDTO>;
}

interface ReadOtherUserResponseLocals extends BaseLocals {
    email: string;
    username: string;
    isVerified: string;
}

export { ReadOtherUserResponse, ReadOtherUserResponseLocals };
