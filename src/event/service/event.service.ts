import { Repository, ObjectLiteral, DataSource } from 'typeorm';
import { getDistance } from 'geolib';

import BaseService from '../../common/service/base.service';
import ConflictException from '../../common/exception/conflict.exception';
import ForbiddenException from '../../common/exception/forbidden.exception';
import NotFoundException from '../../common/exception/notFound.exception';
import { LOGICAL_OPERATION, SORT_BY, UNIX } from '../../common/enum/event.enum';

import User from '../../auth/entity/user.entity';
import Preference from '../../user/entity/preference.entity';
import Location from '../../location/entity/location.entity';
import UserDTO from '../../auth/dto/user.dto';

import Event from '../entity/event.entity';
import EventDetails from '../entity/event.details';
import CreateEventDTO from '../dto/event.create.dto';
import ReadEventDetailsDTO from '../dto/event.readDetails.dto';
import UpdateEventDTO from '../dto/event.update.dto';
import DeleteEventDTO from '../dto/event.delete.dto';
import EventUserDTO from '../dto/event.user.dto';
import { FilterEventDTO, SortEventDTO, ReadEventDTO, ReadEventQueryDTO } from '../dto/event.read.dto';
import { CreateEventResponseLocals } from '../response/event.create.response';
import { ReadEventDetailsResponseLocals } from '../response/event.readDetails.response';
import { UpdateEventResponseLocals } from '../response/event.update.response';
import { DeleteEventResponseLocals } from '../response/event.delete.response';
import { EventUserResponseLocals } from '../response/event.user.response';

class EventService implements BaseService {
    eventRepository: Repository<ObjectLiteral>;
    userRepository: Repository<ObjectLiteral>;
    categoryRepository: Repository<ObjectLiteral>;
    locationRepository: Repository<ObjectLiteral>;

    constructor(database: DataSource) {
        this.eventRepository = database.getRepository(Event);
        this.userRepository = database.getRepository(User);
        this.categoryRepository = database.getRepository(Preference);
        this.locationRepository = database.getRepository(Location);
    }

    public createEvent = async (body: CreateEventDTO, locals: CreateEventResponseLocals) => {
        try {
            const email = locals.email;
            const username = locals.username;
            const user = await this.getUserByEmailAndUsername(email, username);
            if (!user) throw new NotFoundException('User does not exist.');

            const categoryIDs = body.categories;
            const categories = await this.getCategoriesByID(categoryIDs);
            if (!categories) throw new NotFoundException('Categeory Invalid.');

            const locationID = body.location;
            const location = await this.getLocation(locationID);
            if (!location) throw new NotFoundException('Location unknown.');

            const eventData: Partial<Event> = {
                eventName: body.eventName,
                categories: categories,
                date: body.date,
                startTime: body.startTime,
                endTime: body.endTime,
                longitude: body.longitude,
                latitude: body.latitude,
                location: location,
                locationName: body.locationName,
                shortDescription: body.shortDescription,
                description: body.description,
                eventCreator: user,
            };
            const event = await this.createEventDetails(eventData);
            await this.updateEventCategories(event, categories);
            await this.createEventJoinedByUser(user, event);

            return { message: `Successfully create ${event.eventName} event.` };
        } catch (error) {
            throw error;
        }
    };

    public readEvent = async (body: ReadEventDTO, query: ReadEventQueryDTO) => {
        try {
            const todaysDate = new Date(body.todaysDate);

            const begin = parseInt(query.skip) * parseInt(query.take);
            const end = begin + parseInt(query.take);

            const longitude = body.longitude;
            const latitude = body.latitude;
            const filter = body.filter;
            const sort = body.sort;

            let categories;
            if (filter && filter.eventCategories) categories = filter.eventCategories.category;
            if (!categories) categories = await this.getAllCategoriesID();
            const events = await this.getEventsByCategories(categories);
            const eventsData = await this.constructEventsData(events, longitude, latitude);

            const filteredEvents = this.filterEvents(eventsData, filter, todaysDate);
            const sortedAndFilteredEvents = this.sortEvents(filteredEvents, sort);

            return { message: 'Successfully retrieve events.', events: sortedAndFilteredEvents.slice(begin, end) };
        } catch (error) {
            throw error;
        }
    };

    public readEventDetails = async (body: ReadEventDetailsDTO, locals: ReadEventDetailsResponseLocals) => {
        try {
            const username = locals.username;
            const eventID = body.eventID;
            const event = await this.getEventByEventID(eventID);
            if (!event) throw new NotFoundException('Event does not exist.');

            let locationData: Partial<Location>;
            if (event.location) locationData = this.constructEventLocationData(event.location);
            const participants = await this.getEventParticipants(event);
            const participantsList = await this.constructParticipantsData(participants);
            const participated = this.getParticipated(participants, username);
            const eventDetails = await this.constructEventDetailsData(
                event,
                participantsList,
                participated,
                locationData,
            );

            const isEventCreator = locals.username == event.eventCreator.username ? true : false;

            return {
                message: 'Successfully retrieve event details.',
                isEventCreator: isEventCreator,
                event: eventDetails,
            };
        } catch (error) {
            throw error;
        }
    };

    public updateEvent = async (body: UpdateEventDTO, locals: UpdateEventResponseLocals) => {
        try {
            const username = locals.username;

            const eventID = body.eventID;
            const event = await this.getEventByEventID(eventID);
            if (!event) throw new NotFoundException('Event does not exist.');
            if (event.eventCreator.username != username)
                throw new ForbiddenException(`You are unauthorized to update ${event.eventName} event.`);

            const locationID = body.location;
            const location = await this.getLocation(locationID);
            await this.updateEventDetails(body, eventID, location);

            const categoryIDs = body.categories;
            const categories = await this.getCategoriesByID(categoryIDs);
            if (!categories) throw new NotFoundException('Categories Invalid.');

            await this.updateEventCategories(event, categories);

            return { message: `Successfully update ${event.eventName} event.` };
        } catch (error) {
            throw error;
        }
    };

    public deleteEvent = async (body: DeleteEventDTO, locals: DeleteEventResponseLocals) => {
        try {
            const username = locals.username;
            const eventID = body.eventID;
            const event = await this.getEventByEventID(eventID);
            if (!event) throw new NotFoundException('Event does not exist.');
            if (event.eventCreator.username != username)
                throw new ForbiddenException(`You are unauthorized to delete ${event.eventName} event.`);

            await this.deleteEventByEventID(eventID);

            return { message: `Successfully delete ${event.eventName} event.` };
        } catch (error) {
            throw error;
        }
    };

    public joinEvent = async (body: EventUserDTO, locals: EventUserResponseLocals) => {
        try {
            const email = locals.email;
            const username = locals.username;
            const user = await this.getUserByEmailAndUsername(email, username);
            if (!user) throw new NotFoundException('User does not exist.');

            const eventID = body.eventID;
            const event = await this.getEventByEventID(eventID);
            if (!event) throw new NotFoundException('Event does not exist.');

            await this.createEventJoinedByUser(user, event);

            return { message: `Successfully joined ${event.eventName} event.` };
        } catch (error) {
            throw error;
        }
    };

    public cancelEvent = async (body: EventUserDTO, locals: EventUserResponseLocals) => {
        try {
            const email = locals.email;
            const username = locals.username;
            const user = await this.getUserByEmailAndUsername(email, username);
            if (!user) throw new NotFoundException('User does not exist.');

            const eventID = body.eventID;
            const event = await this.getEventByEventID(eventID);
            if (!event) throw new NotFoundException('Event does not exist.');
            if (event.eventCreator.username == username)
                throw new ForbiddenException('You are not allowed to take this action at your own event.');

            await this.cancelEventJoinedByUser(user, event);

            return { message: `Successfully cancelled ${event.eventName} event.` };
        } catch (error) {
            throw error;
        }
    };

    private createEventDetails = async (eventData: Partial<Event>) => {
        const queryBuilder = this.eventRepository.createQueryBuilder();
        const eventInsertResult = await queryBuilder.insert().into(Event).values(eventData).returning('*').execute();
        const event = eventInsertResult.generatedMaps[0] as Event;
        return event;
    };

    private createEventJoinedByUser = async (user: User, event: Event) => {
        try {
            const queryBuilder = this.userRepository.createQueryBuilder();
            await queryBuilder.relation(User, 'eventJoined').of(user).add(event);
        } catch (error) {
            throw new ConflictException(`You already joined the ${event.eventName} event.`);
        }
    };

    private cancelEventJoinedByUser = async (user: User, event: Event) => {
        const queryBuilder = this.userRepository.createQueryBuilder();
        await queryBuilder.relation(User, 'eventJoined').of(user).remove(event);
    };

    private getEventByEventID = async (eventID: number) => {
        const queryBuilder = this.eventRepository.createQueryBuilder('event');
        const event = await queryBuilder
            .innerJoinAndSelect('event.categories', 'categories')
            .innerJoin('event.eventCreator', 'event_creator')
            .leftJoin('event.location', 'location')
            .addSelect(['location.locationID', 'location.suburb', 'location.city', 'location.state'])
            .addSelect(['event_creator.firstName', 'event_creator.lastName', 'event_creator.username'])
            .where('event.eventID = :eventID', { eventID: eventID })
            .getOne();
        return event as Event;
    };

    private getEventsByCategories = async (categories: string[]) => {
        const queryBuilder = this.eventRepository.createQueryBuilder('event');
        const events = await queryBuilder
            .select([
                'event.eventID',
                'event.eventName',
                'event.date',
                'event.longitude',
                'event.latitude',
                'event.locationName',
                'event_creator.username',
                'event_creator.firstName',
                'event_creator.lastName',
            ])
            .innerJoin('event.categories', 'categories')
            .innerJoin('event.eventCreator', 'event_creator')
            .where('event_categories.category_id IN (:...categories)', { categories: categories })
            .getMany();
        return events as Event[];
    };

    private getEventCategories = async (event: Event) => {
        const queryBuilder = this.eventRepository.createQueryBuilder();
        const categories = await queryBuilder.relation(Event, 'categories').of(event).loadMany();
        return categories;
    };

    private getEventParticipants = async (event: Event) => {
        const queryBuilder = this.eventRepository.createQueryBuilder();
        const participants = await queryBuilder.relation(Event, 'participants').of(event).loadMany();
        return participants as User[];
    };

    private getEventParticipantsMap = async (events: Event[]) => {
        const participantsMap = events.map(async (event) => {
            const participants = await this.getEventParticipants(event);
            return participants.length;
        });
        return Promise.all(participantsMap);
    };

    private getAllCategoriesID = async () => {
        const queryBuilder = this.categoryRepository.createQueryBuilder();
        const categories = await queryBuilder
            .select('preference.preferenceID')
            .from(Preference, 'preference')
            .getMany();
        const categoryIDs = categories.map((category) => category.preferenceID);
        return categoryIDs;
    };

    private getCategoriesByID = async (preferenceIDs: string[]) => {
        const queryBuilder = this.categoryRepository.createQueryBuilder();
        const categories = await queryBuilder
            .select(['preference.preferenceID', 'preference.preferenceName'])
            .from(Preference, 'preference')
            .where('preference.preferenceID IN (:...preferenceIDs)', { preferenceIDs: preferenceIDs })
            .getMany();
        return categories;
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
                'user.isVerified',
                'user.isFirstLogin',
                'user.isShareLocation',
            ])
            .leftJoin('user.location', 'location')
            .where('user.email = :email', { email: email })
            .andWhere('user.username = :username', { username: username })
            .getOne();

        return user as User;
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

    private getUserLocation = async (userID: number) => {
        const queryBuilder = this.userRepository.createQueryBuilder('user');
        const user = await queryBuilder
            .select(['user.userID', 'location.suburb'])
            .leftJoin('user.location', 'location')
            .where('user.userID = :userID', { userID: userID })
            .getOne();

        return user as User;
    };

    private updateEventDetails = async (body: UpdateEventDTO, eventID: number, location: Location) => {
        const queryBuilder = this.eventRepository.createQueryBuilder();
        await queryBuilder
            .update(Event)
            .set({
                eventName: body.eventName,
                date: body.date,
                startTime: body.startTime,
                endTime: body.endTime,
                longitude: body.longitude,
                latitude: body.latitude,
                location: location,
                locationName: body.locationName,
                shortDescription: body.shortDescription,
                description: body.description,
            })
            .where('eventID = :eventID', { eventID: eventID })
            .execute();
    };

    private updateEventCategories = async (event: Event, categories: Preference[]) => {
        const queryBuilder = this.eventRepository.createQueryBuilder();
        const oldCategories = await this.getEventCategories(event);
        await queryBuilder.relation(Event, 'categories').of(event).addAndRemove(categories, oldCategories);
    };

    private deleteEventByEventID = async (eventID: number) => {
        const queryBuilder = this.eventRepository.createQueryBuilder();
        await queryBuilder.delete().from(Event).where('eventID = :eventID', { eventID: eventID }).execute();
    };

    private filterEvents = (events: Partial<EventDetails>[], filter: FilterEventDTO, todaysDate: Date) => {
        let filteredEvents = events;

        if (!filter) return filteredEvents;

        const daysToEventDTO = filter.daysToEvent;
        const radiusDTO = filter.eventRadius;

        if (radiusDTO && radiusDTO.radius) {
            filteredEvents = filteredEvents.filter((event) => this.filterEventsWithinRadius(event, radiusDTO.radius, radiusDTO.isMoreOrLess));
        }

        if (daysToEventDTO && daysToEventDTO.days) {
            filteredEvents = filteredEvents.filter((event) =>
                this.filterEventsWithinDays(event, daysToEventDTO.days, todaysDate, daysToEventDTO.isMoreOrLess),
            );
        }

        return filteredEvents;
    };

    private sortEvents = (events: Partial<EventDetails>[], sort: SortEventDTO) => {
        let sortedEvents = events;

        if (!sort) return sortedEvents;

        const sortBy = sort.sortBy;
        if (!sortBy) return sortedEvents;

        if (sortBy.toUpperCase() == SORT_BY.DISTANCE) {
            sortedEvents = sortedEvents.sort((event1, event2) => this.sortEventsByDistance(event1, event2));
        } else if (sortBy.toUpperCase() == SORT_BY.POPULARITY) {
            sortedEvents = sortedEvents.sort((event1, event2) => this.sortEventsByPopularity(event1, event2));
        } else if (sortBy.toUpperCase() == SORT_BY.DAYS_TO_EVENT) {
            sortedEvents = sortedEvents.sort((event1, event2) => this.sortEventsByDays(event1, event2));
        }

        return sortedEvents;
    };

    private constructEventsData = async (events: Event[], longitude: number, latitude: number) => {
        const eventsData = events.map(async (event) => await this.constructEventData(event, longitude, latitude));
        return Promise.all(eventsData);
    };

    private constructEventData = async (event: Event, longitude: number, latitude: number) => {
        const distance = this.calculateDistanceBetweenUserAndEventLocation(event, longitude, latitude);
        const participants = await this.getEventParticipants(event);
        const eventData: Partial<EventDetails> = {
            eventID: event.eventID,
            eventName: event.eventName,
            date: event.date,
            distance: distance,
            longitude: event.longitude,
            latitude: event.latitude,
            locationName: event.locationName,
            eventCreator: event.eventCreator,
            participants: participants.length,
        };
        return eventData;
    };

    private calculateDistanceBetweenUserAndEventLocation = (event: Event, longitude: number, latitude: number) => {
        const from = { longitude: longitude, latitude: latitude };
        const to = { longitude: event.longitude, latitude: event.latitude };
        const distance = parseFloat((getDistance(from, to) / 1000).toFixed(1));
        return distance;
    };

    private filterEventsWithinRadius = (event: Partial<EventDetails>, radius: number, isMoreOrLess: string) => {
        if (isMoreOrLess == LOGICAL_OPERATION.LESS) return event.distance <= radius;
        else return event.distance >= radius;
    };

    private filterEventsWithinDays = (
        event: Partial<EventDetails>,
        daysToEvent: number,
        todaysDate: Date,
        isMoreOrLess: string,
    ) => {
        const eventDate = new Date(event.date);
        const difference = (eventDate.getTime() - todaysDate.getTime()) / UNIX.MILLI_SECONDS;
        const daysToEventInSeconds = UNIX.ONE_DAY * daysToEvent;
        if (isMoreOrLess == LOGICAL_OPERATION.LESS) return difference >= 0 && difference <= daysToEventInSeconds;
        else return difference >= daysToEventInSeconds;
    };

    private sortEventsByDistance = (event1: Partial<EventDetails>, event2: Partial<EventDetails>) => {
        return event1.distance > event2.distance ? 1 : -1;
    };

    private sortEventsByPopularity = (event1: Partial<EventDetails>, event2: Partial<EventDetails>) => {
        return event1.participants < event2.participants ? 1 : -1;
    };

    private sortEventsByDays = (event1: Partial<EventDetails>, event2: Partial<EventDetails>) => {
        return event1.date > event2.date ? 1 : -1;
    };

    private constructEventDetailsData = async (
        event: Event,
        participants: Partial<UserDTO>[],
        participated: boolean,
        location: Partial<Location>,
    ) => {
        const eventDetailsData: EventDetails = {
            eventID: event.eventID,
            eventName: event.eventName,
            categories: event.categories,
            date: event.date,
            startTime: event.startTime,
            endTime: event.endTime,
            longitude: event.longitude,
            latitude: event.latitude,
            location: location,
            locationName: event.locationName,
            shortDescription: event.shortDescription,
            description: event.description,
            eventCreator: event.eventCreator,
            participants: participants.length,
            participantsList: participants,
            participated: participated,
        };
        return eventDetailsData;
    };

    private constructParticipantsData = async (participants: User[]) => {
        const participantsList = participants.map(
            async (participant) => await this.constructParticipantData(participant),
        );
        return Promise.all(participantsList);
    };

    private constructParticipantData = async (user: User) => {
        let locationData: Partial<Location>;

        if (user.isShareLocation) {
            const userLocation = await this.getUserLocation(user.userID);
            locationData = this.constructUserLocationData(userLocation.location);
        }

        const participantData: Partial<UserDTO> = {
            userID: user.userID,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            location: locationData,
            isShareLocation: user.isShareLocation,
        };
        return participantData;
    };

    private constructUserLocationData = (location: Location) => {
        const locationData: Partial<Location> = {
            suburb: location.suburb,
        };
        return locationData;
    };

    private constructEventLocationData = (location: Location) => {
        const locationData: Partial<Location> = {
            suburb: location.suburb,
            city: location.city,
        };
        return locationData;
    };

    private getParticipated = (participants: User[], username: string) => {
        const participated = participants.filter((participant) => this.filterParticipants(participant, username));
        return participated.length == 1 ? true : false;
    };

    private filterParticipants = (participant: User, username: string) => {
        return participant.username == username;
    };
}

export default EventService;
