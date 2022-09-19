import { getDistance } from 'geolib';
import { SearchClient, SearchIndex } from 'algoliasearch';
import { Repository, ObjectLiteral, DataSource } from 'typeorm';

import Algolia from '../../common/config/algolia';
import BaseService from '../../common/service/base.service';
import ConflictException from '../../common/exception/conflict.exception';
import ForbiddenException from '../../common/exception/forbidden.exception';
import NotFoundException from '../../common/exception/notFound.exception';
import SortDTO from '../../common/dto/sort.dto';
import { LOGICAL_OPERATION, SORT_BY, UNIX } from '../../common/enum/event.enum';

import User from '../../auth/entity/user.entity';
import Preference from '../../user/entity/preference.entity';
import Location from '../../location/entity/location.entity';
import Image from '../../image/entity/image.entity';
import UserDTO from '../../auth/dto/user.dto';

import Event from '../entity/event.entity';
import EventAlgolia from '../entity/event.algolia.entity';
import EventDetails from '../entity/event.details.entity';
import CreateEventDTO from '../dto/event.create.dto';
import ReadEventDetailsDTO from '../dto/event.readDetails.dto';
import UpdateEventDTO from '../dto/event.update.dto';
import DeleteEventDTO from '../dto/event.delete.dto';
import EventUserDTO from '../dto/event.user.dto';
import EventImageDTO from '../dto/event.image.dto';
import { FilterEventDTO, ReadEventDTO, ReadEventQueryDTO } from '../dto/event.read.dto';
import { CreateEventResponseLocals } from '../response/event.create.response';
import { ReadEventDetailsResponseLocals } from '../response/event.readDetails.response';
import { UpdateEventResponseLocals } from '../response/event.update.response';
import { DeleteEventResponseLocals } from '../response/event.delete.response';
import { EventUserResponseLocals } from '../response/event.user.response';
import { ReadEventResponseLocals } from '../response/event.read.response';
import { EventImageResponseLocals } from '../response/event.image.response';

class EventService implements BaseService {
    eventRepository: Repository<ObjectLiteral>;
    userRepository: Repository<ObjectLiteral>;
    categoryRepository: Repository<ObjectLiteral>;
    locationRepository: Repository<ObjectLiteral>;
    imageRepository: Repository<ObjectLiteral>;
    algolia: SearchClient;
    index: SearchIndex;

    constructor(database: DataSource) {
        this.eventRepository = database.getRepository(Event);
        this.userRepository = database.getRepository(User);
        this.categoryRepository = database.getRepository(Preference);
        this.locationRepository = database.getRepository(Location);
        this.imageRepository = database.getRepository(Image);

        this.algolia = Algolia;
        this.index = this.algolia.initIndex('event');

        this.index.setSettings({
            searchableAttributes: ['eventName', 'eventCreator', 'locationName', 'suburb', 'city', 'state', 'country'],
            attributesForFaceting: ['categories'],
        });
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

            const data = this.constructAlgoliaData(event.eventID, event, location, user, categories);
            await this.index.saveObject(data);

            return { message: `Successfully create ${event.eventName} event.`, eventID: event.eventID };
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
            const keyword = body.search.keyword;

            let categories;
            if (filter && filter.eventCategories) categories = filter.eventCategories.category;
            if (!categories) categories = await this.getAllCategoriesID();
            const categoryString = `${this.constructCategoryString(categories)}`;

            const eventsAlgolia = await this.index.search<EventAlgolia>(keyword, { filters: categoryString });
            const eventsIDs = eventsAlgolia.hits.map((event) => event.eventID);
            const events = await this.getEventsByEventIDs(eventsIDs);
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

            const data = this.constructAlgoliaData(eventID, body, location, event.eventCreator, categories);
            await this.index.saveObject(data);

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
            if (event.eventImage) await this.deleteEventImageByImageID(event.eventImage.imageID);

            await this.index.deleteObject(eventID.toString());

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

    public readHaveNotYetJoinedEvents = async (
        body: ReadEventDTO,
        locals: ReadEventResponseLocals,
        query: ReadEventQueryDTO,
    ) => {
        try {
            const begin = parseInt(query.skip) * parseInt(query.take);
            const end = begin + parseInt(query.take);

            const longitude = body.longitude;
            const latitude = body.latitude;
            const filter = body.filter;
            const sort = body.sort;

            const email = locals.email;
            const username = locals.username;
            const user = await this.getUserByEmailAndUsername(email, username);
            if (!user) throw new NotFoundException('User does not exist.');

            const eventsNotJoined = await this.getUserNotJoinedEvents(user.userID);
            const eventsData = await this.constructEventsData(eventsNotJoined, longitude, latitude);
            const filteredEvents = this.filterEvents(eventsData, filter, undefined);
            const sortedAndFilteredEvents = this.sortEvents(filteredEvents, sort);

            return {
                message: 'Successfully retrieve not joined events.',
                events: sortedAndFilteredEvents.slice(begin, end),
            };
        } catch (error) {
            throw error;
        }
    };

    public uploadEventImage = async (
        body: EventImageDTO,
        file: Express.MulterS3.File,
        locals: EventImageResponseLocals,
    ) => {
        try {
            const email = locals.email;
            const username = locals.username;
            const user = await this.getUserByEmailAndUsername(email, username);
            if (!user) throw new NotFoundException('User does not exist.');

            const eventID = Number(body.eventID);
            const event = await this.getEventByEventID(eventID);
            if (!event) throw new NotFoundException('Event does not exist.');
            if (event.eventCreator.username != username)
                throw new ForbiddenException('You are not allowed to take this action at this event.');

            const imageData = this.constructImageData(file);
            const image = await this.createEventImage(imageData);
            await this.updateEventImage(event, image);

            return { message: 'Successfully upload event image.' };
        } catch (error) {
            throw error;
        }
    };

    public saveToAlgolia = async () => {
        try {
            const events = await this.getEvents();
            events.map(async (event) => {
                const data = this.constructSaveAlgoliaData(event);
                await this.index.saveObject(data);
            });

            return { message: 'Success import data to algolia' };
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

    private createEventImage = async (imageData: Partial<Image>) => {
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

    private cancelEventJoinedByUser = async (user: User, event: Event) => {
        const queryBuilder = this.userRepository.createQueryBuilder();
        await queryBuilder.relation(User, 'eventJoined').of(user).remove(event);
    };

    private getEventByEventID = async (eventID: number) => {
        const queryBuilder = this.eventRepository.createQueryBuilder('event');
        const event = await queryBuilder
            .leftJoinAndSelect('event.categories', 'categories')
            .leftJoin('event.eventCreator', 'event_creator')
            .leftJoin('event.location', 'location')
            .leftJoin('event.eventImage', 'event_image')
            .addSelect([
                'location.locationID',
                'location.suburb',
                'location.city',
                'location.state',
                'event_creator.firstName',
                'event_creator.lastName',
                'event_creator.username',
                'event_image.imageUrl',
            ])
            .where('event.eventID = :eventID', { eventID: eventID })
            .getOne();
        return event as Event;
    };

    private getEventsByEventIDs = async (eventIDs: number[]) => {
        const queryBuilder = this.eventRepository.createQueryBuilder('event');
        const events = await queryBuilder
            .select([
                'event.eventID',
                'event.eventName',
                'event.date',
                'event.longitude',
                'event.latitude',
                'event.locationName',
                'location.suburb',
                'location.city',
                'location.state',
                'event_creator.username',
                'event_creator.firstName',
                'event_creator.lastName',
                'event_image.imageUrl',
            ])
            .leftJoin('event.eventCreator', 'event_creator')
            .leftJoin('event.location', 'location')
            .leftJoin('event.eventImage', 'event_image')
            .where('event.eventID IN (:...eventIDs)', { eventIDs: [null, ...eventIDs] })
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

    private getUserNotJoinedEvents = async (userID: number) => {
        const eventQueryBuilder = this.eventRepository.createQueryBuilder('event');
        const userQueryBuilder = this.userRepository.createQueryBuilder('user');

        const eventsJoined = await userQueryBuilder
            .leftJoinAndSelect('user.eventJoined', 'event')
            .where('user.userID = :userID', { userID: userID })
            .getOne();
        const eventJoinedIDs = eventsJoined.eventJoined.map((cc: Event) => cc.eventID);

        const eventsNotJoined = await eventQueryBuilder
            .select([
                'event.eventID',
                'event.eventName',
                'event.date',
                'event.longitude',
                'event.latitude',
                'event.locationName',
                'location.suburb',
                'location.city',
                'location.state',
                'event_creator.username',
                'event_creator.firstName',
                'event_creator.lastName',
            ])
            .leftJoin('event.eventCreator', 'event_creator')
            .leftJoin('event.location', 'location')
            .where('event.eventID NOT IN (:...eventIDs)', { eventIDs: [-1, ...eventJoinedIDs] })
            .getMany();
        return eventsNotJoined as Event[];
    };

    private getEvents = async () => {
        const queryBuilder = this.eventRepository.createQueryBuilder('event');
        const events = await queryBuilder
            .select([
                'event.eventID',
                'event.eventName',
                'event.shortDescription',
                'event.description',
                'categories.preferenceID',
                'event.locationName',
                'location.locationID',
                'location.suburb',
                'location.city',
                'location.state',
                'location.country',
                'event.date',
                'event.startTime',
                'event.endTime',
                'event_creator.username',
                'event_image.imageUrl',
            ])
            .innerJoin('event.categories', 'categories')
            .innerJoin('event.eventCreator', 'event_creator')
            .innerJoin('event.location', 'location')
            .innerJoin('event.eventImage', 'event_image')
            .getMany();
        return events as Event[];
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

    private updateEventImage = async (event: Event, image: Image) => {
        const queryBuilder = this.eventRepository.createQueryBuilder();
        if (event.eventImage) await this.deleteEventImageByImageID(event.eventImage.imageID);
        await queryBuilder.relation(Event, 'eventImage').of(event).set(image);
    };

    private deleteEventByEventID = async (eventID: number) => {
        const queryBuilder = this.eventRepository.createQueryBuilder();
        await queryBuilder.delete().from(Event).where('eventID = :eventID', { eventID: eventID }).execute();
    };

    private deleteEventImageByImageID = async (imageID: string) => {
        const queryBuilder = this.imageRepository.createQueryBuilder();
        await queryBuilder.delete().from(Image).where('imageID = :imageID', { imageID: imageID }).execute();
    };

    private filterEvents = (events: Partial<EventDetails>[], filter: FilterEventDTO, todaysDate: Date) => {
        let filteredEvents = events;

        if (!filter) return filteredEvents;

        const daysToEventDTO = filter.daysToEvent;
        const radiusDTO = filter.eventRadius;

        if (radiusDTO && radiusDTO.radius) {
            filteredEvents = filteredEvents.filter((event) =>
                this.filterEventsWithinRadius(event, radiusDTO.radius, radiusDTO.isMoreOrLess),
            );
        }

        if (daysToEventDTO && daysToEventDTO.days) {
            filteredEvents = filteredEvents.filter((event) =>
                this.filterEventsWithinDays(event, daysToEventDTO.days, todaysDate, daysToEventDTO.isMoreOrLess),
            );
        }

        return filteredEvents;
    };

    private sortEvents = (events: Partial<EventDetails>[], sort: SortDTO) => {
        let sortedEvents = events;

        if (!sort) return sortedEvents;

        const sortBy = sort.sortBy;
        if (!sortBy) return sortedEvents;

        if (sortBy.toUpperCase() == SORT_BY.DISTANCE) {
            sortedEvents = sortedEvents.sort((event1, event2) => this.sortEventsByDistance(event1, event2, sort));
        } else if (sortBy.toUpperCase() == SORT_BY.POPULARITY) {
            sortedEvents = sortedEvents.sort((event1, event2) => this.sortEventsByPopularity(event1, event2, sort));
        } else if (sortBy.toUpperCase() == SORT_BY.DAYS_TO_EVENT) {
            sortedEvents = sortedEvents.sort((event1, event2) => this.sortEventsByDays(event1, event2, sort));
        }

        return sortedEvents;
    };

    private constructCategoryString = (categories: string[]) => {
        const categoriesString = categories.map((category) => `categories:${category}`);
        return categoriesString.join(' OR ');
    };

    private constructEventsData = async (events: Event[], longitude: number, latitude: number) => {
        const eventsData = events.map(async (event) => await this.constructEventData(event, longitude, latitude));
        return Promise.all(eventsData);
    };

    private constructEventData = async (event: Event, longitude: number, latitude: number) => {
        const distance = this.calculateDistanceBetweenUserAndEventLocation(event, longitude, latitude);
        const participants = await this.getEventParticipants(event);
        const location = this.constructEventLocationData(event.location);
        const eventData: Partial<EventDetails> = {
            eventID: event.eventID,
            eventName: event.eventName,
            date: event.date,
            distance: distance,
            longitude: event.longitude,
            latitude: event.latitude,
            location: location,
            locationName: event.locationName,
            eventImage: event.eventImage,
            eventCreator: event.eventCreator,
            participants: participants.length,
        };
        return eventData;
    };

    private constructSaveAlgoliaData = (event: Event) => {
        const data = {
            objectID: event.eventID,
            eventID: event.eventID,
            eventName: event.eventName,
            shortDescription: event.shortDescription,
            description: event.description,
            categories: event.categories.map((category) => category.preferenceID),
            locationName: event.locationName,
            locationID: event.location.locationID,
            suburb: event.location.suburb,
            city: event.location.city,
            state: event.location.state,
            country: event.location.country,
            date: event.date,
            startTime: event.startTime,
            endTime: event.endTime,
            eventCreator: event.eventCreator.username,
        };
        return data;
    };

    private constructAlgoliaData = (
        eventID: number,
        event: Event | UpdateEventDTO,
        location: Location,
        creator: User,
        categories: Preference[],
    ) => {
        const data = {
            objectID: eventID,
            eventName: event.eventName,
            shortDescription: event.shortDescription,
            description: event.description,
            categories: categories.map((category) => category.preferenceName),
            locationName: event.locationName,
            suburb: location.suburb,
            city: location.city,
            state: location.state,
            country: location.country,
            date: event.date,
            startTime: event.startTime,
            endTime: event.endTime,
            eventCreator: creator.username,
        };
        return data;
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
            eventImage: event.eventImage,
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
        } else {
            locationData = this.constructUserLocationData(undefined);
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
            suburb: location ? location.suburb : 'No Location',
        };
        return locationData;
    };

    private constructEventLocationData = (location: Location) => {
        const locationData: Partial<Location> = {
            suburb: location.suburb,
            city: location.city,
            state: location.state,
        };
        return locationData;
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

    private filterEventsWithinRadius = (event: Partial<EventDetails>, radius: number, isMoreOrLess: string) => {
        if (isMoreOrLess == LOGICAL_OPERATION.LESS) return event.distance <= radius;
        return event.distance >= radius;
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
        return difference >= daysToEventInSeconds;
    };

    private sortEventsByDistance = (event1: Partial<EventDetails>, event2: Partial<EventDetails>, sort: SortDTO) => {
        if (sort.isMoreOrLess == LOGICAL_OPERATION.MORE) return event1.distance < event2.distance ? 1 : -1;
        return event1.distance > event2.distance ? 1 : -1;
    };

    private sortEventsByPopularity = (event1: Partial<EventDetails>, event2: Partial<EventDetails>, sort: SortDTO) => {
        if (sort.isMoreOrLess == LOGICAL_OPERATION.LESS) return event1.participants > event2.participants ? 1 : -1;
        return event1.participants < event2.participants ? 1 : -1;
    };

    private sortEventsByDays = (event1: Partial<EventDetails>, event2: Partial<EventDetails>, sort: SortDTO) => {
        if (sort.isMoreOrLess == LOGICAL_OPERATION.MORE) return event1.date < event2.date ? 1 : -1;
        return event1.date > event2.date ? 1 : -1;
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
