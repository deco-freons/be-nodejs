import { IsISO8601, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import CategoriesDTO from '../../common/dto/category.dto';
import DaysDTO from '../../common/dto/days.dto';
import RadiusDTO from '../../common/dto/radius.dto';
import UserLongLatDTO from '../../user/dto/user.longlat.dto';
import SortDTO from '../../common/dto/sort.dto';

class FilterEventDTO {
    @ValidateNested()
    @Type(() => CategoriesDTO)
    eventCategories: CategoriesDTO;

    @ValidateNested()
    @Type(() => DaysDTO)
    daysToEvent: DaysDTO;

    @ValidateNested()
    @Type(() => RadiusDTO)
    eventRadius: RadiusDTO;
}

class ReadEventDTO extends UserLongLatDTO {
    @ValidateNested()
    @Type(() => FilterEventDTO)
    filter: FilterEventDTO;

    @ValidateNested()
    @Type(() => SortDTO)
    sort: SortDTO;

    @IsISO8601()
    todaysDate: string;
}

class ReadEventQueryDTO {
    @IsString()
    skip: string;

    @IsString()
    take: string;
}

export { FilterEventDTO, ReadEventDTO, ReadEventQueryDTO };
