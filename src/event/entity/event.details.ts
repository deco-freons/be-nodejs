import User from '../../auth/entity/user.entity';
import Preference from '../../user/entity/preference.entity';

class EventDetails {
    eventID: number;
    eventName: string;
    categories: Preference[];
    date: string;
    startTime: string;
    endTime: string;
    longitude: number;
    latitude: number;
    distance: number;
    description: string;
    eventCreator: User;
}

export default EventDetails;
