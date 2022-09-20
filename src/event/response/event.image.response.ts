import { ImageResponse, ImageResponseBody, ImageResponseLocals } from '../../image/response/image.response';

interface EventImageResponse<ResBody = EventImageResponseBody, Locals = EventImageResponseLocals>
    extends ImageResponse<ResBody, Locals> {}

interface EventImageResponseBody extends ImageResponseBody {}

interface EventImageResponseLocals extends ImageResponseLocals {}

export { EventImageResponse, EventImageResponseLocals };
