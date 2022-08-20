import { Repository, ObjectLiteral, DataSource } from 'typeorm';

import BaseService from '../../common/service/base.service';
import BadRequestException from '../../common/exception/badRequest.exception';
import NotFoundException from '../../common/exception/notFound.exception';

import User from '../../auth/entity/user.entity';

import Preference from '../entity/preference.entity';
import UserPreferenceDTO from '../dto/user.preference.dto';
import UpdateUserDTO from '../dto/user.update.dto';
import { UpsertUserPreferenceResponseLocals } from '../response/userPreference.upsert.response';
import { ReadUserResponseLocals } from '../response/user.read.response';
import { UpdateUserResponseLocals } from '../response/user.update.response';

class UserService implements BaseService {
    userRepository: Repository<ObjectLiteral>;
    preferenceRepository: Repository<ObjectLiteral>;

    constructor(database: DataSource) {
        this.userRepository = database.getRepository(User);
        this.preferenceRepository = database.getRepository(Preference);
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
            const userData = this.constructUserData(user, preferences);

            return { message: 'Successfully retrieved user details.', userData: userData };
        } catch (error) {
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

            return { message: 'Successfully update user details', userData: userData };
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

    private getPreferencesByID = async (preferenceIDs: string[]) => {
        const queryBuilder = this.preferenceRepository.createQueryBuilder();
        const preferences = await queryBuilder
            .select(['preference.preferenceID', 'preference.preferenceName'])
            .from(Preference, 'preference')
            .where('preference.preferenceID IN (:...preferenceIDs)', { preferenceIDs: preferenceIDs })
            .getMany();
        return preferences;
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
}

export default UserService;
