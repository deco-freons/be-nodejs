import { IsIn } from 'class-validator';

class UserPreferenceDTO {
    @IsIn(['GM', 'MV', 'DC', 'CL', 'BB', 'NT', 'FB'], { each: true })
    preferences: string[];
}

export default UserPreferenceDTO;
