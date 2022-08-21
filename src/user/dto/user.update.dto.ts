import { IsIn, IsISO8601, IsString } from 'class-validator';

class UpdateUserDTO {
    @IsString()
    firstName: string;
    
    @IsString()
    lastName: string;

    @IsISO8601({ strict: true })
    birthDate: string;
    
    @IsIn(['GM', 'MV', 'DC', 'CL', 'BB', 'NT', 'FB'], { each: true })
    preferences: string[];
}

export default UpdateUserDTO;