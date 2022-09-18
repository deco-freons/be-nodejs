import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';

interface UserImageResponse<ResBody = UserImageResponseBody, Locals = UserImageResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface UserImageResponseBody extends BaseResponseBody {}

interface UserImageResponseLocals extends BaseLocals {}

export { UserImageResponse, UserImageResponseLocals };
