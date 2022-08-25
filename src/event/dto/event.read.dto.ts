import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import UserLongLatDTO from '../../user/dto/user.longlat.dto';

class ReadEventDTO extends UserLongLatDTO {
    @IsIn(['GM', 'MV', 'DC', 'CL', 'BB', 'NT', 'FB'], { each: true })
    @IsOptional()
    categories: string[];

    @IsNumber()
    radius: number;
}

class ReadEventQueryDTO {
    @IsString()
    skip: string;

    @IsString()
    take: string;
}

export { ReadEventDTO, ReadEventQueryDTO };
