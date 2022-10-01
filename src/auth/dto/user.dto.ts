import Location from '../../common/entity/location.entity';
import Preference from '../../common/entity/preference.entity';
import EventDetails from '../../event/entity/event.details.entity';
import Image from '../../image/entity/image.entity';

class UserDTO {
    userID: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    birthDate: string;
    location: Partial<Location>;
    userImage: Partial<Image>;
    preferences: Preference[];
    eventCreated: Partial<EventDetails>[];
    isVerified: boolean;
    isFirstLogin: boolean;
    isShareLocation: boolean;
}

export default UserDTO;
