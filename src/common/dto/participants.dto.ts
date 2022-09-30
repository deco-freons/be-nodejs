import { IsNumber, IsOptional } from 'class-validator';
import { NumericFilterDTO } from './numeric.filter.dto';

class ParticipantsDTO extends NumericFilterDTO {
    @IsNumber()
    @IsOptional()
    participants: number;
}

export default ParticipantsDTO;
