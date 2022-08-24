import { IsNumber } from 'class-validator';

class ReadEventDetailsDTO {
    @IsNumber()
    eventID: number;
}

export default ReadEventDetailsDTO;
