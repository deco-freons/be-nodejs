import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';
import EventDetails from '../entity/event.details.entity';

interface ReadEventDetailsResponse<ResBody = ReadEventDetailsResponseBody, Locals = ReadEventDetailsResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface ReadEventDetailsResponseBody extends BaseResponseBody {
    isEventCreator: boolean;
    event: EventDetails;
}

interface ReadEventDetailsResponseLocals extends BaseLocals {}

export { ReadEventDetailsResponse, ReadEventDetailsResponseLocals };
