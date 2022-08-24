import { IsNumber } from 'class-validator';
import CreateEventDTO from './event.create.dto';

class UpdateEventDTO extends CreateEventDTO {
    @IsNumber()
    eventID: number;
}

export default UpdateEventDTO;
