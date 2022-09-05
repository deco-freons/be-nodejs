import { IsIn, IsNumber, IsOptional } from 'class-validator';
import { NumericFilterDTO } from './numeric.filter.dto';
import { EVENT } from '../enum/event.enum';

class RadiusDTO extends NumericFilterDTO {
    @IsNumber()
    @IsIn(EVENT.RADIUS, { each: true })
    @IsOptional()
    radius: number;
}

export default RadiusDTO;
