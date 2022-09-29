import { IsNumber, IsString } from 'class-validator';
import CreateEventDTO from './event.create.dto';

class UpdateEventDTO extends CreateEventDTO {
    @IsNumber()
    eventID: number;

    @IsString()
    eventStatus: string;
}

export default UpdateEventDTO;
