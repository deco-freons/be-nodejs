import { IsIn, IsISO8601, IsOptional, IsString, ValidateNested } from 'class-validator';
import { EVENT } from '../../common/enum/event.enum';
import UserLongLatDTO from '../../user/dto/user.longlat.dto';
class FilterEventDTO {
    @IsIn(EVENT.CATEGORIES, { each: true })
    @IsOptional()
    categories: string[];

    @IsIn(EVENT.DAYS_TO_EVENT, { each: true })
    @IsOptional()
    daysToEvent: number[];

    @IsIn(EVENT.RADIUS, { each: true })
    radius: number[];
}

class SortEventDTO {
    @IsIn(EVENT.SORT_BY)
    @IsString()
    @IsOptional()
    sortBy: string;
}
class ReadEventDTO extends UserLongLatDTO {
    @ValidateNested()
    filter: FilterEventDTO;

    @ValidateNested()
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
