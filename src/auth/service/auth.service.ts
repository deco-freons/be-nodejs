import { Repository, ObjectLiteral, DataSource } from 'typeorm';

import BaseService from '../../common/service/base.service';
import JWT from '../../common/utils/jwt';
import Redis from '../../common/config/cache/redis';
import BadRequestException from '../../common/exception/badRequest.exception';
import UnauthorizedException from '../../common/exception/unauthorized.exception';
import { compare, hash } from '../../common/utils/hash';
import { TokenTTL } from '../../common/enum/token.enum';

import User from '../entity/user.entity';
import RegisterDTO from '../dto/register.dto';
import LoginDTO from '../dto/login.dto';

class AuthService implements BaseService {
    repository: Repository<ObjectLiteral>;

    constructor(database: DataSource) {
        this.repository = database.getRepository(User);
    }

    public register = async (body: RegisterDTO) => {
        try {
            const queryBuilder = await this.repository.createQueryBuilder();

            const user = await queryBuilder
                .select(['user.userID'])
                .from(User, 'user')
                .where('user.username = :username', { username: body.username })
                .orWhere('user.email = :email', { email: body.email })
                .getOne();
            if (user) {
                throw new BadRequestException('User already exist');
            }

            const hashedPassword = await hash(body.password);
            await queryBuilder
                .insert()
                .into(User)
                .values({
                    ...body,
                    password: hashedPassword,
                })
                .execute();
            return 'User has been created, please check your email to verify your account';
        } catch (error) {
            console.log(error);
            throw error;
        }
    };

    public login = async (body: LoginDTO) => {
        try {
            const user = await this.repository
                .createQueryBuilder()
                .select([
                    'user.userID',
                    'user.username',
                    'user.firstName',
                    'user.lastName',
                    'user.email',
                    'user.password',
                    'user.birthDate',
                    'user.isVerified',
                ])
                .from(User, 'user')
                .where('user.username = :username', { username: body.username })
                .getOne();

            if (!user) {
                throw new BadRequestException('Username or password does not match');
            }

            if (!user.isVerified) {
                throw new UnauthorizedException('Account is not verified');
            }

            const matched = await compare(body.password, user.password);
            if (!matched) {
                throw new BadRequestException('Username or password does not match');
            }

            const userData: Partial<User> = {
                userID: user.userID,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                birthDate: user.birthDate,
            };

            const userID = user.userID;
            const userPayload = {
                username: user.username,
                email: user.email,
            };
            const hashedID = await hash(String(userID));
            const accessToken = await JWT.signAccessToken(userPayload);
            const refreshToken = await JWT.signRefreshToken(userPayload);

            Redis.set(hashedID, refreshToken);
            Redis.expire(hashedID, TokenTTL.REFRESH_TTL);

            return { message: 'Login Successful', userData, accessToken, refreshToken };
        } catch (error) {
            throw error;
        }
    };
}

export default AuthService;
