import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';
import Image from '../entity/image.entity';

interface ImageResponse<ResBody = ImageResponseBody, Locals = ImageResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface ImageResponseBody extends BaseResponseBody {
    image: Partial<Image>;
}

interface ImageResponseLocals extends BaseLocals {}

export { ImageResponse, ImageResponseBody, ImageResponseLocals };
