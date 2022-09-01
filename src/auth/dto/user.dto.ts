import Location from "../../location/entity/location.entity";
import Preference from '../../user/entity/preference.entity';

class UserDTO {
    userID: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    birthDate: string;
    location: Partial<Location>;
    preferences: Preference[];
    isVerified: boolean;
    isFirstLogin: boolean;
    isShareLocation: boolean;
}

export default UserDTO;