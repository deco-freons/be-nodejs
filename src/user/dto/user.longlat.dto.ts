import { IsLatitude, IsLongitude } from 'class-validator';

class UserLongLatDTO  {
    @IsLongitude()
    longitude: number;

    @IsLatitude()
    latitude: number;
}

export default UserLongLatDTO;
