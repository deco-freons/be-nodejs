import { IsNumber, IsOptional } from 'class-validator';
import { NumericFilterDTO } from './numeric.filter.dto';

class PriceFilterDTO extends NumericFilterDTO{
    @IsNumber()
    @IsOptional()
    price: number;
}

export default PriceFilterDTO;
