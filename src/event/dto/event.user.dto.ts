import { IsNumber } from 'class-validator';

class EventUserDTO {
    @IsNumber()
    eventID: number;
}

export default EventUserDTO;
