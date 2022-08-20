import { IsIn } from 'class-validator';

class UserPreferenceDTO {
    @IsIn(['GM', 'MV', 'DC', 'CL', 'BB', 'NT', 'FB'], { each: true })
    preferenceID: string[];
}

export default UserPreferenceDTO;
