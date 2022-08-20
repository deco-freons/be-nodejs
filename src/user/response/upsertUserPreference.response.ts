import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';

interface UpsertUserPreferenceResponse<
    ResBody = UpsertUserPreferenceResponseBody,
    Locals = UpsertUserPreferenceResponseLocals,
> extends BaseResponse<ResBody, Locals> {}

interface UpsertUserPreferenceResponseBody extends BaseResponseBody {}

interface UpsertUserPreferenceResponseLocals extends BaseLocals {
    email: string;
    username: string;
}

export { UpsertUserPreferenceResponse, UpsertUserPreferenceResponseLocals };
