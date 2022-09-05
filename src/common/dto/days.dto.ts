import { IsIn, IsNumber, IsOptional } from 'class-validator';
import { NumericFilterDTO } from './numeric.filter.dto';
import { EVENT } from '../enum/event.enum';

class DaysDTO extends NumericFilterDTO {
    @IsNumber()
    @IsIn(EVENT.DAYS_TO_EVENT, { each: true })
    @IsOptional()
    days: number;
}

export default DaysDTO;
