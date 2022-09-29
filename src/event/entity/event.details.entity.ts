import Preference from '../../common/entity/preference.entity';
import Price from '../../common/entity/price.entity';
import Status from '../../common/entity/status.entity';

import User from '../../auth/entity/user.entity';
import UserDTO from '../../auth/dto/user.dto';
import Location from '../../common/entity/location.entity';
import Image from '../../image/entity/image.entity';

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
    eventPrice: Partial<Price>;
    eventCreator: User;
    eventImage: Partial<Image>;
    eventStatus: Partial<Status>;
    participants: number;
    participantsList: Partial<UserDTO>[];
    participated: boolean;
}

export default EventDetails;
