import EventDetails from '../../event/entity/event.details.entity';
import Location from '../../common/entity/location.entity';
import Preference from '../../common/entity/preference.entity';
import Image from '../../image/entity/image.entity';

class UserDetails {
    userID: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    birthDate: string;
    location: Partial<Location>;
    preferences: Preference[];
    userImage: Partial<Image>;
    eventCreated: Partial<EventDetails>[];
    isShareLocation: boolean;
}

export default UserDetails;
