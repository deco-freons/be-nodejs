import User from '../../auth/entity/user.entity';
import UserDTO from '../../auth/dto/user.dto';
import Preference from '../../user/entity/preference.entity';
import Location from '../../location/entity/location.entity';

class EventDetails {
    eventID: number;
    eventName: string;
    categories: Preference[];
    date: string;
    startTime: string;
    endTime: string;
    longitude: number;
    latitude: number;
    location: Partial<Location>;
    locationName: string;
    distance?: number;
    shortDescription: string;
    description: string;
    eventCreator: User;
    participants: number;
    participantsList: Partial<UserDTO>[];
    participated: boolean;
}

export default EventDetails;
