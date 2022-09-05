import { IsIn, IsISO8601, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EVENT } from '../../common/enum/event.enum';
import CategoriesDTO from '../../common/dto/category.dto';
import DaysDTO from '../../common/dto/days.dto';
import RadiusDTO from '../../common/dto/radius.dto';
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

class SortEventDTO {
    @IsIn(EVENT.SORT_BY)
    @IsString()
    @IsOptional()
    sortBy: string;
}

class ReadEventDTO extends UserLongLatDTO {
    @ValidateNested()
    @Type(() => FilterEventDTO)
    filter: FilterEventDTO;

    @ValidateNested()
    @Type(() => SortEventDTO)
    sort: SortEventDTO;

    @IsISO8601()
    todaysDate: string;
}

class ReadEventQueryDTO {
    @IsString()
    skip: string;

    @IsString()
    take: string;
}

export { FilterEventDTO, SortEventDTO, ReadEventDTO, ReadEventQueryDTO };
