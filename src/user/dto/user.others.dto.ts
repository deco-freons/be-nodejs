import { IsLatitude, IsLongitude, IsNumber } from 'class-validator';

class UserOtherDTO {
    @IsNumber()
    userID: number;

    @IsLongitude()
    longitude: number;

    @IsLatitude()
    latitude: number;
}

export default UserOtherDTO;
