import { Repository, ObjectLiteral, DataSource } from 'typeorm';
import { getDistance } from 'geolib';

import BaseService from '../../common/service/base.service';
import BadRequestException from '../../common/exception/badRequest.exception';
import NotFoundException from '../../common/exception/notFound.exception';

import User from '../../auth/entity/user.entity';
import Event from '../../event/entity/event.entity';
import EventDetails from '../../event/entity/event.details';

import Preference from '../entity/preference.entity';
import UserPreferenceDTO from '../dto/user.preference.dto';
import UpdateUserDTO from '../dto/user.update.dto';
import UserLongLatDTO from '../dto/user.longlat.dto';
import { UpsertUserPreferenceResponseLocals } from '../response/userPreference.upsert.response';
import { ReadUserResponseLocals } from '../response/user.read.response';
import { UpdateUserResponseLocals } from '../response/user.update.response';
import { UserEventsResponseLocals } from '../response/user.events.response';

class UserService implements BaseService {
    userRepository: Repository<ObjectLiteral>;
    preferenceRepository: Repository<ObjectLiteral>;
    eventRepository: Repository<ObjectLiteral>;

    constructor(database: DataSource) {
        this.userRepository = database.getRepository(User);
        this.preferenceRepository = database.getRepository(Preference);
        this.eventRepository = database.getRepository(Event);
    }

    public upsertUserPreference = async (body: UserPreferenceDTO, locals: UpsertUserPreferenceResponseLocals) => {
        try {
            const email = locals.email;
            const username = locals.username;
            const user = await this.getUserByEmailAndUsername(email, username);
            if (!user) throw new NotFoundException('User does not exist.');

            const preferenceIDs = body.preferences;
            const preferences = await this.getPreferencesByID(preferenceIDs);
            if (!preferences) throw new BadRequestException('Preferences Invalid.');

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
            const events = await this.getUserEvents(user.userID);
            const userData = this.constructUserDataWithEvents(user, preferences, events);

            return { message: 'Successfully retrieved user details.', userData: userData };
        } catch (error) {
            console.log(error);
            throw error;
        }
    };

    public updateUser = async (body: UpdateUserDTO, locals: UpdateUserResponseLocals) => {
        try {
            const email = locals.email;
            const username = locals.username;
            await this.updateUserDetails(body, email, username);

            const user = await this.getUserByEmailAndUsername(email, username);
            if (!user) throw new NotFoundException('User does not exist.');

            const preferenceIDs = body.preferences;
            const preferences = await this.getPreferencesByID(preferenceIDs);
            if (!preferences) throw new BadRequestException('Preferences Invalid.');

            await this.updateUserPreferences(user, preferences);

            const userData = this.constructUserData(user, preferences);

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

    private constructUserData = (user: User, preferences: Preference[]) => {
        const userData: Partial<User> = {
            userID: user.userID,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            birthDate: user.birthDate,
            preferences: preferences,
            isVerified: user.isVerified,
            isFirstLogin: user.isFirstLogin,
        };
        return userData;
    };

    private constructUserDataWithEvents = (user: User, preferences: Preference[], events: Event[]) => {
        const userData = this.constructUserData(user, preferences);
        userData.eventCreated = events;
        return userData;
    };

    private getUserByEmailAndUsername = async (email: string, username: string) => {
        const queryBuilder = this.userRepository.createQueryBuilder();
        const user = await queryBuilder
            .select([
                'user.userID',
                'user.username',
                'user.firstName',
                'user.lastName',
                'user.email',
                'user.birthDate',
                'user.isVerified',
                'user.isFirstLogin',
            ])
            .from(User, 'user')
            .where('user.email = :email', { email: email })
            .andWhere('user.username = :username', { username: username })
            .getOne();
        return user;
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
            ])
            .innerJoin('event.categories', 'categories')
            .innerJoin('event.eventCreator', 'event_creator')
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

    private updateUserPreferences = async (user: User, preferences: Preference[]) => {
        const queryBuilder = this.userRepository.createQueryBuilder();
        const oldPreferences = await this.getUserPreferences(user);
        await queryBuilder.relation(User, 'preferences').of(user).addAndRemove(preferences, oldPreferences);
    };

    private updateUserDetails = async (body: UpdateUserDTO, email: string, username: string) => {
        const queryBuilder = this.userRepository.createQueryBuilder();
        await queryBuilder
            .update(User)
            .set({ firstName: body.firstName, lastName: body.lastName, birthDate: body.birthDate })
            .where('username = :username', { username: username })
            .andWhere('email = :email', { email: email })
            .execute();
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
            date: event.eventName,
            distance: distance,
            longitude: event.longitude,
            latitude: event.latitude,
        };
        return eventData;
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
