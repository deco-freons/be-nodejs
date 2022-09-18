import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';

interface UploadEventImageResponse<ResBody = UploadEventImageResponseBody, Locals = UploadEventImageResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface UploadEventImageResponseBody extends BaseResponseBody {}

interface UploadEventImageResponseLocals extends BaseLocals {}

export { UploadEventImageResponse, UploadEventImageResponseLocals };
