import { IsNumber } from 'class-validator';

class DeleteEventDTO {
    @IsNumber()
    eventID: number;
}

export default DeleteEventDTO;
