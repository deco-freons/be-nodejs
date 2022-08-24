import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';

import Event from '../entity/event.entity';

interface ReadEventDetailsResponse<ResBody = ReadEventDetailsResponseBody, Locals = ReadEventDetailsResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface ReadEventDetailsResponseBody extends BaseResponseBody {
    isEventCreator: boolean;
    event: Event;
}

interface ReadEventDetailsResponseLocals extends BaseLocals {
    email: string;
    username: string;
    isVerified: string;
}

export { ReadEventDetailsResponse, ReadEventDetailsResponseLocals };
