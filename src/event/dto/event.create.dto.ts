import {
    IsIn,
    IsISO8601,
    IsLatitude,
    IsLongitude,
    IsMilitaryTime,
    IsNumber,
    IsString,
    MaxLength,
    MinLength,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import PriceDTO from '../../common/dto/price.dto';

class CreateEventDTO {
    @IsString()
    @MinLength(1)
    eventName: string;

    @IsIn(['GM', 'MV', 'DC', 'CL', 'BB', 'NT', 'FB'], { each: true })
    categories: string[];

    @IsISO8601({ strict: true })
    date: string;

    @IsMilitaryTime()
    startTime: string;

    @IsMilitaryTime()
    endTime: string;

    @IsLongitude()
    longitude: number;

    @IsLatitude()
    latitude: number;

    @IsNumber()
    location: number;

    @IsString()
    locationName: string;

    @IsString()
    @MaxLength(100)
    shortDescription: string;

    @IsString()
    description: string;

    @ValidateNested()
    @Type(() => PriceDTO)
    eventPrice: PriceDTO;
}

export default CreateEventDTO;
