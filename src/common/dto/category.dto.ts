import { IsIn, IsOptional } from 'class-validator';
import { EVENT } from '../enum/event.enum';

class CategoriesDTO {
    @IsIn(EVENT.CATEGORIES, { each: true })
    @IsOptional()
    category: string[];
}

export default CategoriesDTO;
