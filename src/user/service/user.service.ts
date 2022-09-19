import { Repository, ObjectLiteral, DataSource } from 'typeorm';
import { getDistance } from 'geolib';

import BaseService from '../../common/service/base.service';
import NotFoundException from '../../common/exception/notFound.exception';

import User from '../../auth/entity/user.entity';
import Event from '../../event/entity/event.entity';
import EventDetails from '../../event/entity/event.details.entity';
import Image from '../../image/entity/image.entity';
import Location from '../../location/entity/location.entity';

import Preference from '../entity/preference.entity';
import UserDetails from '../entity/user.details.entity';
import UserPreferenceDTO from '../dto/user.preference.dto';
import UpdateUserDTO from '../dto/user.update.dto';
import UserLongLatDTO from '../dto/user.longlat.dto';
import UserOtherDTO from '../dto/user.others.dto';
import { UpsertUserPreferenceResponseLocals } from '../response/userPreference.upsert.response';
import { ReadUserResponseLocals } from '../response/user.read.response';
import { UpdateUserResponseLocals } from '../response/user.update.response';
import { UserEventsResponseLocals } from '../response/user.events.response';
import { UserImageResponseLocals } from '../response/user.image.response';

class UserService implements BaseService {
    userRepository: Repository<ObjectLiteral>;
    preferenceRepository: Repository<ObjectLiteral>;
    eventRepository: Repository<ObjectLiteral>;
    locationRepository: Repository<ObjectLiteral>;
    imageRepository: Repository<ObjectLiteral>;

    constructor(database: DataSource) {
        this.userRepository = database.getRepository(User);
        this.preferenceRepository = database.getRepository(Preference);
        this.eventRepository = database.getRepository(Event);
        this.locationRepository = database.getRepository(Location);
        this.imageRepository = database.getRepository(Image);
    }

    public upsertUserPreference = async (body: UserPreferenceDTO, locals: UpsertUserPreferenceResponseLocals) => {
        try {
            const email = locals.email;
            const username = locals.username;
            const user = await this.getUserByEmailAndUsername(email, username);
            if (!user) throw new NotFoundException('User does not exist.');

            const preferenceIDs = body.preferences;
            const preferences = await this.getPreferencesByID(preferenceIDs);
            if (!preferences) throw new NotFoundException('Preferences Invalid.');

            await this.updateUserPreferences(user, preferences);

            return { message: 'User preferences updated.' };
        } catch (error) {
            throw error;
        }
    };

    public readUser = async (locals: ReadUserResponseLocals) => {
        try {
            const email = locals.email;
            const username = locals.username;
            const user = await this.getUserByEmailAndUsername(email, username);
            if (!user) throw new NotFoundException('User does not exist.');

            const preferences = await this.getUserPreferences(user);

            let locationData: Partial<Location>;
            if (user.isShareLocation && user.location) {
                locationData = this.constructLocationData(user.location);
            }

            const userData = this.constructUserData(user, preferences, locationData);

            return { message: 'Successfully retrieved user details.', userData: userData };
        } catch (error) {
            throw error;
        }
    };

    public readOtherUser = async (body: UserOtherDTO) => {
        try {
            const longitude = body.longitude;
            const latitude = body.latitude;
            const userID = body.userID;
            const user = await this.getUserByUserID(userID);
            if (!user) throw new NotFoundException('User does not exist.');

            const preferences = await this.getUserPreferences(user);

            let locationData: Partial<Location>;
            if (user.isShareLocation && user.location) {
                locationData = this.constructLocationData(user.location);
            }

            const events = await this.getUserEvents(user.userID);
            const eventsData = this.constructEventsByUser(events, longitude, latitude);

            const userData = this.constructUserDataWithEvents(user, preferences, eventsData, locationData);

            return { message: 'Successfully retrieved user details.', userData: userData };
        } catch (error) {
            throw error;
        }
    };

    public updateUser = async (body: UpdateUserDTO, locals: UpdateUserResponseLocals) => {
        try {
            const email = locals.email;
            const username = locals.username;
            const location = await this.getLocation(body.location);
            await this.updateUserDetails(body, email, username, location);

            const user = await this.getUserByEmailAndUsername(email, username);
            if (!user) throw new NotFoundException('User does not exist.');

            const preferenceIDs = body.preferences;
            const preferences = await this.getPreferencesByID(preferenceIDs);
            if (!preferences) throw new NotFoundException('Preferences Invalid.');

            await this.updateUserPreferences(user, preferences);

            let locationData: Partial<Location>;
            if (user.isShareLocation && user.location) {
                locationData = this.constructLocationData(user.location);
            }

            const userData = this.constructUserData(user, preferences, locationData);

            return { message: 'Successfully update user details.', userData: userData };
        } catch (error) {
            throw error;
        }
    };

    public readEventsByUser = async (body: UserLongLatDTO, locals: UserEventsResponseLocals) => {
        try {
            const username = locals.username;
            const email = locals.email;
            const user = await this.getUserByEmailAndUsername(email, username);
            if (!user) throw new NotFoundException('User does not exist.');

            const longitude = body.longitude;
            const latitude = body.latitude;
            const events = await this.getUserEvents(user.userID);
            const eventsData = this.constructEventsByUser(events, longitude, latitude);

            return { message: 'Successfully retrieve events by user.', events: eventsData };
        } catch (error) {
            throw error;
        }
    };

    public uploadUserImage = async (file: Express.MulterS3.File, locals: UserImageResponseLocals) => {
        try {
            const username = locals.username;
            const email = locals.email;
            const user = await this.getUserByEmailAndUsername(email, username);
            if (!user) throw new NotFoundException('User does not exist.');

            const imageData = this.constructImageData(file);
            const image = await this.createUserImage(imageData);
            await this.updateUserImage(user, image);

            return { message: 'Successfully upload user image ' };
        } catch (error) {
            throw error;
        }
    };

    private createUserImage = async (imageData: Partial<Image>) => {
        const imageQueryBuilder = this.imageRepository.createQueryBuilder();
        const eventImageInsertResult = await imageQueryBuilder
            .insert()
            .into(Image)
            .values(imageData)
            .returning('*')
            .execute();
        const eventImage = eventImageInsertResult.generatedMaps[0] as Image;
        return eventImage;
    };

    private getUserByEmailAndUsername = async (email: string, username: string) => {
        const queryBuilder = this.userRepository.createQueryBuilder('user');
        const user = await queryBuilder
            .select([
                'user.userID',
                'user.username',
                'user.firstName',
                'user.lastName',
                'user.email',
                'user.birthDate',
                'location.suburb',
                'user_image.imageUrl',
                'user.isShareLocation',
            ])
            .leftJoin('user.location', 'location')
            .leftJoin('user.userImage', 'user_image')
            .where('user.email = :email', { email: email })
            .andWhere('user.username = :username', { username: username })
            .getOne();
        return user as User;
    };

    private getUserByUserID = async (userID: number) => {
        const queryBuilder = this.userRepository.createQueryBuilder('user');
        const user = await queryBuilder
            .select([
                'user.userID',
                'user.username',
                'user.firstName',
                'user.lastName',
                'location.suburb',
                'user_image.imageUrl',
                'user.isShareLocation',
            ])
            .leftJoin('user.location', 'location')
            .leftJoin('user.userImage', 'user_image')
            .where('user.userID = :userID', { userID: userID })
            .getOne();
        return user as User;
    };

    private getUserEvents = async (userID: number) => {
        const queryBuilder = this.eventRepository.createQueryBuilder('event');
        const events = await queryBuilder
            .select([
                'event.eventID',
                'event.eventName',
                'event.date',
                'event.longitude',
                'event.latitude',
                'categories.preferenceID',
                'categories.preferenceName',
                'event_image.imageUrl',
            ])
            .leftJoin('event.categories', 'categories')
            .leftJoin('event.eventCreator', 'event_creator')
            .leftJoin('event.eventImage', 'event_image')
            .where('event.eventCreator = :userID', { userID: userID })
            .getMany();
        return events as Event[];
    };

    private getPreferencesByID = async (preferenceIDs: string[]) => {
        const queryBuilder = this.preferenceRepository.createQueryBuilder();
        const preferences = await queryBuilder
            .select(['preference.preferenceID', 'preference.preferenceName'])
            .from(Preference, 'preference')
            .where('preference.preferenceID IN (:...preferenceIDs)', { preferenceIDs: preferenceIDs })
            .getMany();
        return preferences;
    };

    private getUserPreferences = async (user: User) => {
        const queryBuilder = this.userRepository.createQueryBuilder();
        const preferences = await queryBuilder.relation(User, 'preferences').of(user).loadMany();
        return preferences;
    };

    private getLocation = async (locationID: number) => {
        const queryBuilder = this.locationRepository.createQueryBuilder();
        const location = await queryBuilder
            .select(['location.locationID', 'location.suburb', 'location.city', 'location.state', 'location.country'])
            .from(Location, 'location')
            .where('location.locationID = :locationID', { locationID: locationID })
            .getOne();
        return location;
    };

    private updateUserPreferences = async (user: User, preferences: Preference[]) => {
        const queryBuilder = this.userRepository.createQueryBuilder();
        const oldPreferences = await this.getUserPreferences(user);
        await queryBuilder.relation(User, 'preferences').of(user).addAndRemove(preferences, oldPreferences);
    };

    private updateUserDetails = async (body: UpdateUserDTO, email: string, username: string, location: Location) => {
        const queryBuilder = this.userRepository.createQueryBuilder();
        await queryBuilder
            .update(User)
            .set({
                firstName: body.firstName,
                lastName: body.lastName,
                birthDate: body.birthDate,
                isShareLocation: body.isShareLocation,
                location: location,
            })
            .where('username = :username', { username: username })
            .andWhere('email = :email', { email: email })
            .execute();
    };

    private updateUserImage = async (user: User, image: Image) => {
        const queryBuilder = this.userRepository.createQueryBuilder();
        if (user.userImage) await this.deleteEventImageByImageID(user.userImage.imageID);
        await queryBuilder.relation(User, 'userImage').of(user).set(image);
    };

    private deleteEventImageByImageID = async (imageID: string) => {
        const queryBuilder = this.imageRepository.createQueryBuilder();
        await queryBuilder.delete().from(Image).where('imageID = :imageID', { imageID: imageID }).execute();
    };

    private constructUserData = (user: User, preferences: Preference[], location: Partial<Location>) => {
        const userData: Partial<UserDetails> = {
            userID: user.userID,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            birthDate: user.birthDate,
            location: location,
            preferences: preferences,
            userImage: user.userImage,
            isShareLocation: user.isShareLocation,
        };
        return userData;
    };

    private constructEventsByUser = (events: Event[], longitude: number, latitude: number) => {
        const eventsByUserWithinRadius = events
            .map((event) => this.constructEventsData(event, longitude, latitude))
            .sort((event1, event2) => this.sortEventsByDistance(event1, event2));
        return eventsByUserWithinRadius;
    };

    private constructEventsData = (event: Event, longitude: number, latitude: number) => {
        const distance = this.calculateDistanceBetweenUserAndEventLocation(event, longitude, latitude);
        const eventData: Partial<EventDetails> = {
            eventID: event.eventID,
            eventName: event.eventName,
            date: event.date,
            distance: distance,
            longitude: event.longitude,
            latitude: event.latitude,
            eventImage: event.eventImage,
        };
        return eventData;
    };

    private constructLocationData = (location: Location) => {
        const locationData: Partial<Location> = {
            suburb: location.suburb,
        };
        return locationData;
    };

    private constructUserDataWithEvents = (
        user: User,
        preferences: Preference[],
        events: Partial<EventDetails>[],
        location: Partial<Location>,
    ) => {
        const userData = this.constructUserData(user, preferences, location);
        userData.eventCreated = events;
        return userData;
    };

    private constructImageData = (image: Express.MulterS3.File) => {
        const imageData: Partial<Image> = {
            imageID: image.key,
            imageUrl: image.location,
        };
        return imageData;
    };

    private calculateDistanceBetweenUserAndEventLocation = (event: Event, longitude: number, latitude: number) => {
        const from = { longitude: longitude, latitude: latitude };
        const to = { longitude: event.longitude, latitude: event.latitude };
        const distance = parseFloat((getDistance(from, to) / 1000).toFixed(1));
        return distance;
    };

    private sortEventsByDistance = (event1: Partial<EventDetails>, event2: Partial<EventDetails>) => {
        return event1.distance > event2.distance ? 1 : -1;
    };
}

export default UserService;
