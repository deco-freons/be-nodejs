import { ImageResponse, ImageResponseBody, ImageResponseLocals } from '../../image/response/image.response';

interface UserImageResponse<ResBody = UserImageResponseBody, Locals = UserImageResponseLocals>
    extends ImageResponse<ResBody, Locals> {}

interface UserImageResponseBody extends ImageResponseBody {}

interface UserImageResponseLocals extends ImageResponseLocals {}

export { UserImageResponse, UserImageResponseLocals };
