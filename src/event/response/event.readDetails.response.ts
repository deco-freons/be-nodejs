import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';
import EventDetails from '../entity/event.details';

interface ReadEventDetailsResponse<ResBody = ReadEventDetailsResponseBody, Locals = ReadEventDetailsResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface ReadEventDetailsResponseBody extends BaseResponseBody {
    isEventCreator: boolean;
    event: EventDetails;
}

interface ReadEventDetailsResponseLocals extends BaseLocals {
    email: string;
    username: string;
    isVerified: string;
}

export { ReadEventDetailsResponse, ReadEventDetailsResponseLocals };
