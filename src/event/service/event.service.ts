import { Repository, ObjectLiteral, DataSource } from 'typeorm';

import BaseService from '../../common/service/base.service';
import NotFoundException from '../../common/exception/notFound.exception';
import BadRequestException from '../../common/exception/badRequest.exception';

import User from '../../auth/entity/user.entity';
import Preference from '../../user/entity/preference.entity';

import Event from '../entity/event.entity';
import CreateEventDTO from '../dto/event.create.dto';
import ReadEventDTO from '../dto/event.read.dto';
import ReadEventDetailsDTO from '../dto/event.readDetails.dto';
import { CreateEventResponseLocals } from '../response/event.create.response';

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

            return { message: `Successfully create ${event.eventName} event.` };
        } catch (error) {
            throw error;
        }
    };

    public readEvent = async (body: ReadEventDTO) => {
        try {
            let categories = body.categories;
            if (!categories) categories = await this.getAllCategoriesID();
            const events = await this.getEventsByCategories(categories);

            return { message: 'Successfully retrieve events.', events: events };
        } catch (error) {
            console.log(error);
            throw error;
        }
    };

    public readEventDetails = async (body: ReadEventDetailsDTO) => {
        try {
            const eventID = body.eventID;
            const event = await this.getEventByEventID(eventID);

            return { message: 'Successfully retrieve event details.', event: event };
        } catch (error) {
            console.log(error);
            throw error;
        }
    };

    private createEventDetails = async (eventData: Partial<Event>) => {
        const queryBuilder = this.eventRepository.createQueryBuilder();
        const eventInsertResult = await queryBuilder.insert().into(Event).values(eventData).returning('*').execute();
        const event = eventInsertResult.generatedMaps[0] as Event;
        return event;
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

    private updateEventCategories = async (event: Event, categories: Preference[]) => {
        const queryBuilder = this.eventRepository.createQueryBuilder();
        const oldCategories = await this.getEventCategories(event);
        await queryBuilder.relation(Event, 'categories').of(event).addAndRemove(categories, oldCategories);
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
}

export default EventService;
