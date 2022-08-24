import { BaseResponse, BaseResponseBody, BaseLocals } from '../../common/response/base.response';

import Event from '../entity/event.entity';

interface ReadEventResponse<ResBody = ReadEventResponseBody, Locals = ReadEventResponseLocals>
    extends BaseResponse<ResBody, Locals> {}

interface ReadEventResponseBody extends BaseResponseBody {
    events: Event[];
}

interface ReadEventResponseLocals extends BaseLocals {}

export default ReadEventResponse;
