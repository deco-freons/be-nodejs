import { IsIn, IsISO8601, IsString, IsNumber, IsBoolean } from 'class-validator';

class UpdateUserDTO {
    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsISO8601({ strict: true })
    birthDate: string;

    @IsNumber()
    location: number;

    @IsBoolean()
    isShareLocation: boolean;

    @IsIn(['GM', 'MV', 'DC', 'CL', 'BB', 'NT', 'FB'], { each: true })
    preferences: string[];
}

export default UpdateUserDTO;
