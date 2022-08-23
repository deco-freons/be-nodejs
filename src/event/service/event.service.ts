import { Repository, ObjectLiteral, DataSource } from 'typeorm';
import { getDistance } from 'geolib';

import BaseService from '../../common/service/base.service';
import BadRequestException from '../../common/exception/badRequest.exception';
import ConflictException from '../../common/exception/conflict.exception';
import NotFoundException from '../../common/exception/notFound.exception';
import UnauthorizedException from '../../common/exception/unauthorized.exception';

import User from '../../auth/entity/user.entity';
import Preference from '../../user/entity/preference.entity';

import Event from '../entity/event.entity';
import EventDetails from '../entity/event.details';
import CreateEventDTO from '../dto/event.create.dto';
import ReadEventDetailsDTO from '../dto/event.readDetails.dto';
import UpdateEventDTO from '../dto/event.update.dto';
import DeleteEventDTO from '../dto/event.delete.dto';
import EventUserDTO from '../dto/event.user.dto';
import { ReadEventDTO, ReadEventQueryDTO } from '../dto/event.read.dto';
import { CreateEventResponseLocals } from '../response/event.create.response';
import { ReadEventDetailsResponseLocals } from '../response/event.readDetails.response';
import { UpdateEventResponseLocals } from '../response/event.update.response';
import { DeleteEventResponseLocals } from '../response/event.delete.response';
import { EventUserResponseLocals } from '../response/event.user.response';

class EventService implements BaseService {
    eventRepository: Repository<ObjectLiteral>;
    userRepository: Repository<ObjectLiteral>;
    categoryRepository: Repository<ObjectLiteral>;

    constructor(database: DataSource) {
        this.eventRepository = database.getRepository(Event);
        this.userRepository = database.getRepository(User);
        this.categoryRepository = database.getRepository(Preference);
    }

    public createEvent = async (body: CreateEventDTO, locals: CreateEventResponseLocals) => {
        try {
            const email = locals.email;
            const username = locals.username;
            const user = await this.getUserByEmailAndUsername(email, username);
            if (!user) throw new NotFoundException('User does not exist.');

            const categoryIDs = body.categories;
            const categories = await this.getCategoriesByID(categoryIDs);
            if (!categories) throw new BadRequestException('Catgeory Invalid.');

            const eventData: Partial<Event> = {
                eventName: body.eventName,
                categories: categories,
                date: body.date,
                startTime: body.startTime,
                endTime: body.endTime,
                longitude: body.longitude,
                latitude: body.latitude,
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
            const begin = parseInt(query.skip) * parseInt(query.take);
            const end = begin + parseInt(query.take);

            let categories = body.categories;
            if (!categories) categories = await this.getAllCategoriesID();
            const events = await this.getEventsByCategories(categories);
            const sortedAndFilteredEventsWithinRadius = this.getEventsWithinRadius(
                events,
                body.longitude,
                body.latitude,
                body.radius,
            ).slice(begin, end);

            return { message: 'Successfully retrieve events.', events: sortedAndFilteredEventsWithinRadius };
        } catch (error) {
            throw error;
        }
    };

    public readEventDetails = async (body: ReadEventDetailsDTO, locals: ReadEventDetailsResponseLocals) => {
        try {
            const eventID = body.eventID;
            const event = await this.getEventByEventID(eventID);
            const isEventCreator = locals.username == event.eventCreator.username ? true : false;

            return { message: 'Successfully retrieve event details.', isEventCreator: isEventCreator, event: event };
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
                throw new UnauthorizedException(`You are unauthorized to update ${event.eventName} event.`);

            await this.updateEventDetails(body, eventID);

            const categoryIDs = body.categories;
            const categories = await this.getCategoriesByID(categoryIDs);
            if (!categories) throw new BadRequestException('Categories Invalid.');

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
                throw new UnauthorizedException(`You are unauthorized to delete ${event.eventName} event.`);

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

    private getEventByEventID = async (eventID: number) => {
        const queryBuilder = this.eventRepository.createQueryBuilder('event');
        const event = await queryBuilder
            .innerJoinAndSelect('event.categories', 'categories')
            .innerJoin('event.eventCreator', 'event_creator')
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
        const queryBuilder = this.userRepository.createQueryBuilder();
        const user = await queryBuilder
            .select([
                'user.userID',
                'user.username',
                'user.firstName',
                'user.lastName',
                'user.email',
                'user.password',
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

    private updateEventDetails = async (body: UpdateEventDTO, eventID: number) => {
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

    private getEventsWithinRadius = (events: Event[], longitude: number, latitude: number, radius: number) => {
        const eventsWithinRadius = events
            .map((event) => this.constructEventsData(event, longitude, latitude))
            .filter((event) => this.filterEventsWithinRadius(event, radius))
            .sort((event1, event2) => this.sortEventsByDistance(event1, event2));
        return eventsWithinRadius;
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
            eventCreator: event.eventCreator,
        };
        return eventData;
    };

    private calculateDistanceBetweenUserAndEventLocation = (event: Event, longitude: number, latitude: number) => {
        const from = { longitude: longitude, latitude: latitude };
        const to = { longitude: event.longitude, latitude: event.latitude };
        const distance = parseFloat((getDistance(from, to) / 1000).toFixed(1));
        return distance;
    };

    private filterEventsWithinRadius = (event: Partial<EventDetails>, radius: number) => {
        return event.distance <= radius;
    };

    private sortEventsByDistance = (event1: Partial<EventDetails>, event2: Partial<EventDetails>) => {
        return event1.distance > event2.distance ? 1 : -1;
    };
}

export default EventService;
