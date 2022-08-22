import { Repository, ObjectLiteral, DataSource } from 'typeorm';

// import for common
import BaseService from '../../common/service/base.service';
import NotFoundException from '../../common/exception/notFound.exception';
import BadRequestException from '../../common/exception/badRequest.exception';

// import for other service
import User from '../../auth/entity/user.entity';
import Preference from '../../user/entity/preference.entity';

// import untuk event service
import Event from '../entity/event.entity';
import CreateEventDTO from '../dto/event.create.dto';
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
        const queryBuilder = this.eventRepository.createQueryBuilder();
        const event = await queryBuilder
            .select([
                'event.eventID',
                'event.date',
                'event.startTime',
                'event.endTime',
                'event.longitude',
                'event.latitude',
                'event.description',
                'event.eventCreator',
            ])
            .from(Event, 'event')
            .where('event.eventID = :eventID', { eventID: eventID })
            .getOne();
        return event;
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

    private getCategoriesByID = async (preferenceIDs: string[]) => {
        const queryBuilder = this.categoryRepository.createQueryBuilder();
        const preferences = await queryBuilder
            .select(['preference.preferenceID', 'preference.preferenceName'])
            .from(Preference, 'preference')
            .where('preference.preferenceID IN (:...preferenceIDs)', { preferenceIDs: preferenceIDs })
            .getMany();
        return preferences;
    };
}

export default EventService;
