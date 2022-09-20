import { IsNumberString } from 'class-validator';

class EventImageDTO {
    @IsNumberString()
    eventID: string;

    eventImage: string;
}

export default EventImageDTO;
