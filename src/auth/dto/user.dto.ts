import EventDetails from '../../event/entity/event.details.entity';
import Location from '../../location/entity/location.entity';
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
    eventCreated: Partial<EventDetails>[];
    isVerified: boolean;
    isFirstLogin: boolean;
    isShareLocation: boolean;
}

export default UserDTO;
