import { IsIn, IsLatitude, IsLongitude, IsNumber, IsOptional, IsString } from 'class-validator';

class ReadEventDTO {
    @IsIn(['GM', 'MV', 'DC', 'CL', 'BB', 'NT', 'FB'], { each: true })
    @IsOptional()
    categories: string[];

    @IsLongitude()
    longitude: number;

    @IsLatitude()
    latitude: number;

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
