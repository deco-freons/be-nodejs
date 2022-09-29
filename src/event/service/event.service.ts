import { getDistance } from 'geolib';
import { SearchClient, SearchIndex } from 'algoliasearch';
import { Repository, ObjectLiteral, DataSource } from 'typeorm';

import Algolia from '../../common/config/algolia';
import SortDTO from '../../common/dto/sort.dto';
import PriceDTO from '../../common/dto/price.dto';
import Currency from '../../common/entity/currency.entity';
import Price from '../../common/entity/price.entity';
import Status from '../../common/entity/status.entity';
import ConflictException from '../../common/exception/conflict.exception';
import ForbiddenException from '../../common/exception/forbidden.exception';
import NotFoundException from '../../common/exception/notFound.exception';
import BaseService from '../../common/service/base.service';
import { LOGICAL_OPERATION, SORT_BY, UNIX } from '../../common/enum/event.enum';

import User from '../../auth/entity/user.entity';
import Preference from '../../common/entity/preference.entity';
import Location from '../../common/entity/location.entity';
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
import { SearchEventDTO, SearchEventQueryDTO } from '../dto/event.Search.dto';
import { FilterEventDTO, ReadEventDTO, ReadEventQueryDTO } from '../dto/event.read.dto';
import { CreateEventResponseLocals } from '../response/event.create.response';
import { ReadEventResponseLocals } from '../response/event.read.response';
import { ReadEventDetailsResponseLocals } from '../response/event.readDetails.response';
import { UpdateEventResponseLocals } from '../response/event.update.response';
import { DeleteEventResponseLocals } from '../response/event.delete.response';
import { EventUserResponseLocals } from '../response/event.user.response';
import { EventImageResponseLocals } from '../response/event.image.response';

class EventService implements BaseService {
    eventRepository: Repository<ObjectLiteral>;
    userRepository: Repository<ObjectLiteral>;
    categoryRepository: Repository<ObjectLiteral>;
    locationRepository: Repository<ObjectLiteral>;
    imageRepository: Repository<ObjectLiteral>;
    currencyRepository: Repository<ObjectLiteral>;
    priceRepository: Repository<ObjectLiteral>;
    statusRepository: Repository<ObjectLiteral>;
    algolia: SearchClient;
    index: SearchIndex;

    constructor(database: DataSource) {
        this.eventRepository = database.getRepository(Event);
        this.userRepository = database.getRepository(User);
        this.categoryRepository = database.getRepository(Preference);
        this.locationRepository = database.getRepository(Location);
        this.imageRepository = database.getRepository(Image);
        this.currencyRepository = database.getRepository(Currency);
        this.priceRepository = database.getRepository(Price);
        this.statusRepository = database.getRepository(Status);

        this.algolia = Algolia;
        this.index = this.algolia.initIndex('event');

        this.index.setSettings({
            searchableAttributes: ['eventName', 'eventCreator', 'locationName', 'suburb', 'city', 'state', 'country'],
            attributesForFaceting: ['categories', 'eventStatus'],
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
            if (!location) throw new NotFoundException('Location Unknown.');

            const eventPrice = body.eventPrice;
            const eventPriceData = await this.constructEventPriceData(eventPrice);
            const price = await this.createEventPrice(eventPriceData);

            const eventStatus = await this.getStatus('COMING_SOON');

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
                eventStatus: eventStatus,
            };
            const event = await this.createEventDetails(eventData);
            await this.updateEventCategories(event, categories);
            await this.updateEventPrice(event, price);
            await this.createEventJoinedByUser(user, event);

            const data = this.constructAlgoliaData(event.eventID, event, location, user, categories);
            await this.index.saveObject(data);

            return { message: `Successfully create ${event.eventName} event.`, eventID: event.eventID };
        } catch (error) {
            throw error;
        }
    };

    public searchEvent = async (body: SearchEventDTO, query: SearchEventQueryDTO) => {
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
            const categoryString = `${this.constructFilterStrings(categories, 'categories')}`;

            let statuses;
            if (filter && filter.eventStatus) statuses = filter.eventStatus.status;
            if (!statuses) statuses = await this.getAllStatus();
            const statusString = `${this.constructFilterStrings(categories, 'eventStatus')}`;

            const eventsAlgolia = await this.index.search<EventAlgolia>(keyword, {
                facetFilters: [categoryString, statusString],
            });
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
            if (!location) throw new NotFoundException('Location Unknown.');

            const eventStatusID = body.eventStatus;
            const eventStatus = await this.getStatus(eventStatusID);
            if (!eventStatus) throw new NotFoundException('Status Invalid.');

            await this.updateEventDetails(body, eventID, location, eventStatus);

            const categoryIDs = body.categories;
            const categories = await this.getCategoriesByID(categoryIDs);
            if (!categories) throw new NotFoundException('Categories Invalid.');
            await this.updateEventCategories(event, categories);

            const eventPrice = body.eventPrice;
            let price = await this.constructEventPriceData(eventPrice);
            if (!event.eventPrice) price = await this.createEventPrice(price);
            await this.updateEventPrice(event, price);

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

    public readHaveJoinedEvents = async (
        body: ReadEventDTO,
        query: ReadEventQueryDTO,
        locals: ReadEventResponseLocals,
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

            const eventsJoined = await this.getUserJoinedEvents(user.userID);
            const eventsData = await this.constructEventsData(eventsJoined, longitude, latitude);
            const filteredEvents = this.filterEvents(eventsData, filter, undefined);
            const sortedAndFilteredEvents = this.sortEvents(filteredEvents, sort);

            return {
                message: 'Successfully retrieve joined events.',
                events: sortedAndFilteredEvents.slice(begin, end),
            };
        } catch (error) {
            throw error;
        }
    };

    public readHaveNotYetJoinedEvents = async (
        body: ReadEventDTO,
        query: ReadEventQueryDTO,
        locals: ReadEventResponseLocals,
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

            const imageResponse = this.constructImageResponse(file);

            return { message: 'Successfully upload event image.', image: imageResponse };
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
        const queryBuilder = this.imageRepository.createQueryBuilder();
        const eventImageInsertResult = await queryBuilder
            .insert()
            .into(Image)
            .values(imageData)
            .returning('*')
            .execute();
        const eventImage = eventImageInsertResult.generatedMaps[0] as Image;
        return eventImage;
    };

    private createEventPrice = async (eventPriceData: Partial<Price>) => {
        const queryBuilder = this.priceRepository.createQueryBuilder();
        const eventPriceInsertResult = await queryBuilder
            .insert()
            .into(Price)
            .values(eventPriceData)
            .returning('*')
            .execute();
        const eventPrice = eventPriceInsertResult.generatedMaps[0] as Price;
        return eventPrice;
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
            .leftJoin('event.eventPrice', 'event_price')
            .leftJoin('event_price.currency', 'currency')
            .leftJoin('event.eventStatus', 'event_status')
            .addSelect([
                'location.locationID',
                'location.suburb',
                'location.city',
                'location.state',
                'event_price.priceID',
                'event_price.fee',
                'currency.currencyShortName',
                'event_creator.firstName',
                'event_creator.lastName',
                'event_creator.username',
                'event_image.imageUrl',
                'event_status.statusName',
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
                'event_status.statusName',
            ])
            .leftJoin('event.eventCreator', 'event_creator')
            .leftJoin('event.location', 'location')
            .leftJoin('event.eventImage', 'event_image')
            .leftJoin('event.eventStatus', 'event_status')
            .where('event.eventID IN (:...eventIDs)', { eventIDs: [null, ...eventIDs] })
            .getMany();
        return events as Event[];
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
                'location.suburb',
                'location.city',
                'location.state',
                'event_creator.username',
                'event_creator.firstName',
                'event_creator.lastName',
                'event_image.imageUrl',
                'event_status.statusName',
            ])
            .leftJoin('event.categories', 'categories')
            .leftJoin('event.eventCreator', 'event_creator')
            .leftJoin('event.location', 'location')
            .leftJoin('event.eventImage', 'event_image')
            .leftJoin('event.eventStatus', 'event_status')
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

    private getUserJoinedEvents = async (userID: number) => {
        const userQueryBuilder = this.userRepository.createQueryBuilder('user');
        const user = await userQueryBuilder
            .leftJoin('user.eventJoined', 'user_joined_event')
            .leftJoin('user_joined_event.eventCreator', 'event_creator')
            .leftJoin('user_joined_event.location', 'location')
            .leftJoin('user_joined_event.eventImage', 'event_image')
            .leftJoin('user_joined_event.eventStatus', 'event_status')
            .addSelect([
                'user_joined_event.eventID',
                'user_joined_event.eventName',
                'user_joined_event.date',
                'user_joined_event.startTime',
                'user_joined_event.endTime',
                'user_joined_event.longitude',
                'user_joined_event.latitude',
                'user_joined_event.locationName',
                'location.suburb',
                'location.city',
                'location.state',
                'event_creator.username',
                'event_creator.firstName',
                'event_creator.lastName',
                'event_image.imageUrl',
                'event_status.statusName',
            ])
            .where('user.userID = :userID', { userID: userID })
            .getOne();
        return user.eventJoined as Event[];
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
                'event.startTime',
                'event.endTime',
                'event.longitude',
                'event.latitude',
                'location.suburb',
                'location.city',
                'location.state',
                'event.locationName',
                'event.shortDescription',
                'event_price.fee',
                'currency.currencyShortName',
                'event_creator.username',
                'event_creator.firstName',
                'event_creator.lastName',
                'event_image.imageUrl',
                'event_status.statusName',
            ])
            .leftJoin('event.eventCreator', 'event_creator')
            .leftJoin('event.location', 'location')
            .leftJoin('event.eventImage', 'event_image')
            .leftJoin('event.eventPrice', 'event_price')
            .leftJoin('event_price.currency', 'currency')
            .leftJoin('event.eventStatus', 'event_status')
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
                'event_status.statusName',
            ])
            .leftJoin('event.categories', 'categories')
            .leftJoin('event.eventCreator', 'event_creator')
            .leftJoin('event.location', 'location')
            .leftJoin('event.eventImage', 'event_image')
            .leftJoin('event.eventStatus', 'event_status')
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

    private getCurrency = async (currencyShortName: string) => {
        const queryBuilder = this.currencyRepository.createQueryBuilder();
        const currency = await queryBuilder
            .select(['currency.currencyShortName', 'currency.currencyLongName'])
            .from(Currency, 'currency')
            .where('currency.currencyShortName = :currencyShortName', { currencyShortName: currencyShortName })
            .getOne();
        return currency;
    };

    private getStatus = async (statusID: string) => {
        const queryBuilder = this.statusRepository.createQueryBuilder();
        const status = await queryBuilder
            .select(['status.statusID', 'status.statusName'])
            .from(Status, 'status')
            .where('status.statusID = :statusID', { statusID: statusID })
            .getOne();
        return status;
    };

    private getAllStatus = async () => {
        const queryBuilder = this.statusRepository.createQueryBuilder();
        const statuses = await queryBuilder.select('status.statusName').from(Status, 'status').getMany();
        const statusIDs = statuses.map((status) => status.statusName);
        return statusIDs;
    };

    private updateEventDetails = async (body: UpdateEventDTO, eventID: number, location: Location, status: Status) => {
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
                eventStatus: status,
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

    private updateEventPrice = async (event: Event, price: Partial<Price>) => {
        const queryBuilder = this.eventRepository.createQueryBuilder();
        if (event.eventPrice) await this.updateEventPriceByPriceID(event.eventPrice.priceID, price);
        else await queryBuilder.relation(Event, 'eventPrice').of(event).set(price);
    };

    private updateEventPriceByPriceID = async (priceID: string, price: Partial<Price>) => {
        const queryBuilder = this.priceRepository.createQueryBuilder();
        await queryBuilder
            .update(Price)
            .set({
                fee: price.fee,
                currency: price.currency,
            })
            .where('priceID = :priceID', { priceID: priceID })
            .execute();
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

        const radiusDTO = filter.eventRadius;
        const daysToEventDTO = filter.daysToEvent;
        const participantsDTO = filter.eventParticipants;
        const statusDTO = filter.eventStatus;

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

        if (participantsDTO && participantsDTO.participants) {
            filteredEvents = filteredEvents.filter((event) =>
                this.filterEventsWithinNumberOfParticipants(
                    event,
                    participantsDTO.participants,
                    participantsDTO.isMoreOrLess,
                ),
            );
        }

        if (statusDTO && statusDTO.status) {
            filteredEvents = filteredEvents.filter((event) => this.filterEventsWithStatus(event, statusDTO.status));
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

    private constructFilterStrings = (filters: string[], categoryOrStatus: string) => {
        const filterStrings = filters.map((filter) => `${categoryOrStatus}:${filter}`);
        return filterStrings.join(' OR ');
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
            startTime: event.startTime,
            endTime: event.endTime,
            distance: distance,
            longitude: event.longitude,
            latitude: event.latitude,
            shortDescription: event.shortDescription,
            location: location,
            locationName: event.locationName,
            eventPrice: event.eventPrice,
            eventCreator: event.eventCreator,
            eventImage: event.eventImage,
            eventStatus: event.eventStatus,
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
            suburb: event.location.suburb,
            city: event.location.city,
            state: event.location.state,
            country: event.location.country,
            date: event.date,
            startTime: event.startTime,
            endTime: event.endTime,
            eventCreator: event.eventCreator.username,
            eventStatus: event.eventStatus.statusName,
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
            eventID: event.eventID,
            eventName: event.eventName,
            shortDescription: event.shortDescription,
            description: event.description,
            categories: categories.map((category) => category.preferenceID),
            locationName: event.locationName,
            suburb: location.suburb,
            city: location.city,
            state: location.state,
            country: location.country,
            date: event.date,
            startTime: event.startTime,
            endTime: event.endTime,
            eventCreator: creator.username,
            eventStatus: event.eventStatus,
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
            eventPrice: event.eventPrice,
            eventCreator: event.eventCreator,
            eventImage: event.eventImage,
            eventStatus: event.eventStatus,
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

    private constructImageResponse = (image: Express.MulterS3.File) => {
        const imageResponse: Partial<Image> = {
            imageUrl: image.location,
        };
        return imageResponse;
    };

    private constructEventPriceData = async (eventPrice: PriceDTO) => {
        const currency = await this.getCurrency(eventPrice.currency);
        if (!currency) throw new NotFoundException('Currency Invalid.');

        const eventPriceData: Partial<Price> = {
            fee: eventPrice.fee,
            currency: currency,
        };
        return eventPriceData;
    };

    private calculateDistanceBetweenUserAndEventLocation = (event: Event, longitude: number, latitude: number) => {
        const from = { longitude: longitude, latitude: latitude };
        const to = { longitude: event.longitude, latitude: event.latitude };
        const distance = parseFloat((getDistance(from, to) / 1000).toFixed(1));
        return distance;
    };

    private filterEventsWithinRadius = (event: Partial<EventDetails>, radius: number, isMoreOrLess: string) => {
        if (isMoreOrLess == LOGICAL_OPERATION.MORE) return event.distance >= radius;
        return event.distance <= radius;
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
        if (isMoreOrLess == LOGICAL_OPERATION.MORE) return difference >= daysToEventInSeconds;
        return difference >= 0 && difference <= daysToEventInSeconds;
    };

    private filterEventsWithinNumberOfParticipants = (
        event: Partial<EventDetails>,
        participants: number,
        isMoreOrLess: string,
    ) => {
        if (isMoreOrLess == LOGICAL_OPERATION.MORE) return event.participants >= participants;
        return event.participants <= participants;
    };

    private filterEventsWithStatus = (event: Partial<EventDetails>, status: string[]) => {
        return status.includes(event.eventStatus.statusName);
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
