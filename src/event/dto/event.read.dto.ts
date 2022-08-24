import { IsIn, IsLatitude, IsLongitude, IsNumber, IsOptional } from 'class-validator';

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

    @IsNumber()
    @IsOptional()
    pagination: number;
}

export default ReadEventDTO;
