import { IsISO8601, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import CategoriesDTO from '../../common/dto/category.dto';
import DaysDTO from '../../common/dto/days.dto';
import RadiusDTO from '../../common/dto/radius.dto';
import SearchDTO from '../../common/dto/search.dto';
import SortDTO from '../../common/dto/sort.dto';
import UserLongLatDTO from '../../user/dto/user.longlat.dto';

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

    @ValidateNested()
    @Type(() => SearchDTO)
    search: SearchDTO;

    @IsISO8601()
    @IsOptional()
    todaysDate: string;
}

class ReadEventQueryDTO {
    @IsString()
    skip: string;

    @IsString()
    take: string;
}

export { FilterEventDTO, ReadEventDTO, ReadEventQueryDTO };
