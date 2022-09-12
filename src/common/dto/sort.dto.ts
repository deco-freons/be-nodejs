import { IsIn, IsOptional, IsString } from 'class-validator';
import { EVENT } from '../enum/event.enum';
import { NumericFilterDTO } from './numeric.filter.dto';

class SortDTO extends NumericFilterDTO {
    @IsIn(EVENT.SORT_BY)
    @IsString()
    @IsOptional()
    sortBy: string;
}

export default SortDTO;
