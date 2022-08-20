import { Repository, ObjectLiteral, DataSource } from 'typeorm';

import BaseService from '../../common/service/base.service';
import BadRequestException from '../../common/exception/badRequest.exception';
import NotFoundException from '../../common/exception/notFound.exception';
import UnauthorizedException from '../../common/exception/unauthorized.exception';

import User from '../../auth/entity/user.entity';

import Preference from '../entity/preference.entity';
import UserPreferenceDTO from '../dto/user.preference.dto';
import { UpsertUserPreferenceResponseLocals } from '../response/upsertUserPreference.response';

class UserService implements BaseService {
    userRepository: Repository<ObjectLiteral>;
    preferenceRepository: Repository<ObjectLiteral>;

    constructor(database: DataSource) {
        this.userRepository = database.getRepository(User);
        this.preferenceRepository = database.getRepository(Preference);
    }

    public upsertUserPreference = async (body: UserPreferenceDTO, locals: UpsertUserPreferenceResponseLocals) => {
        try {
            const preferenceID = body.preferenceID;
            const preferences = await this.getPreferences(preferenceID);
            if (!preferences) throw new BadRequestException('Preferences Invalid');

            const email = locals.email;
            const username = locals.username;
            const user = await this.getUserByEmailAndUsername(email, username);
            if (!user) throw new NotFoundException('User does not exist.');
            if (!user.isVerified)
                throw new UnauthorizedException('Your account has not been verified yet, please verify first.');

            await this.updateUserPreferences(user, preferences);

            return { message: 'User preferences updated.' };
        } catch (error) {
            throw error;
        }
    };

    private getPreferences = async (preferenceIDs: string[]) => {
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
            .select(['user.userID', 'user.username', 'user.email', 'user.isVerified'])
            .from(User, 'user')
            .where('user.email = :email', { email: email })
            .andWhere('user.username = :username', { username: username })
            .getOne();
        return user;
    };

    private updateUserPreferences = async (user: User, preferences: Preference[]) => {
        const queryBuilder = this.userRepository.createQueryBuilder();
        const oldPreferences = await queryBuilder.relation(User, 'preferences').of(user).loadMany();
        await queryBuilder.relation(User, 'preferences').of(user).addAndRemove(preferences, oldPreferences);
    };
}

export default UserService;
