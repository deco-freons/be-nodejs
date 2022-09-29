import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import SearchDTO from '../../common/dto/search.dto';
import { ReadEventDTO } from './event.read.dto';

class SearchEventDTO extends ReadEventDTO {
    @ValidateNested()
    @Type(() => SearchDTO)
    search: SearchDTO;
}

class SearchEventQueryDTO {
    @IsString()
    skip: string;

    @IsString()
    take: string;
}

export { SearchEventDTO, SearchEventQueryDTO };
