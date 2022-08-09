import { Repository, ObjectLiteral, DataSource } from 'typeorm';

import BaseService from '../../common/service/base.service';
import JWT from '../../common/utils/jwt';
import Redis from '../../common/config/cache/redis';
import BadRequestException from '../../common/exception/badRequest.exception';
import UnauthorizedException from '../../common/exception/unauthorized.exception';
import { compare, hash } from '../../common/utils/hash';

import User from '../entity/user.entity';
import RegisterDTO from '../dto/register.dto';
import LoginDTO from '../dto/login.dto';
import RefreshTokenDTO from '../dto/refreshToken.dto';

class AuthService implements BaseService {
    repository: Repository<ObjectLiteral>;

    constructor(database: DataSource) {
        this.repository = database.getRepository(User);
    }

    public register = async (body: RegisterDTO) => {
        try {
            const queryBuilder = this.repository.createQueryBuilder();

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
            return { message: 'User has been created, please check your email to verify your account' };
        } catch (error) {
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

            const userPayload = {
                username: user.username,
                email: user.email,
            };
            const accessToken = JWT.signAccessToken(userPayload);
            const refreshToken = JWT.signRefreshToken(userPayload);

            return { message: 'Login Successful', userData, accessToken, refreshToken };
        } catch (error) {
            throw error;
        }
    };

    public refreshToken = async (body: RefreshTokenDTO) => {
        const refreshToken = body.refreshToken;

        try {
            const refreshTokenResponse = JWT.verifyRefreshToken(refreshToken);

            const queryBuilder = this.repository.createQueryBuilder();
            const user = await queryBuilder
                .select(['user.userID', 'user.username', 'user.email'])
                .from(User, 'user')
                .where('user.username = :username', { username: refreshTokenResponse.username })
                .orWhere('user.email = :email', { email: refreshTokenResponse.email })
                .getOne();
            if (!user) {
                throw new UnauthorizedException('Invalid Token');
            }

            const refreshTokenRedis = await Redis.get(refreshToken);
            if (refreshTokenRedis == refreshToken) {
                throw new UnauthorizedException('Invalid Token');
            }
            Redis.set(refreshToken, refreshToken);

            const userPayload = {
                username: user.username,
                email: user.email,
            };
            const accessTokenNew = JWT.signAccessToken(userPayload);
            const refreshTokenNew = JWT.signRefreshToken(userPayload);

            return { message: 'Success', accessTokenNew, refreshTokenNew };
        } catch (error) {
            Redis.set(refreshToken, refreshToken);
            throw error;
        }
    };

    public logout = async (body: RefreshTokenDTO) => {
        const refreshToken = body.refreshToken;

        try {
            const refreshTokenResponse = JWT.verifyRefreshToken(refreshToken);

            const queryBuilder = this.repository.createQueryBuilder();
            const user = await queryBuilder
                .select(['user.userID', 'user.username', 'user.email'])
                .from(User, 'user')
                .where('user.username = :username', { username: refreshTokenResponse.username })
                .orWhere('user.email = :email', { email: refreshTokenResponse.email })
                .getOne();
            if (!user) {
                throw new UnauthorizedException('Invalid Token');
            }

            const refreshTokenRedis = await Redis.get(refreshToken);
            if (refreshTokenRedis == refreshToken) {
                throw new UnauthorizedException('Invalid Token');
            }
            Redis.set(refreshToken, refreshToken);

            return;
        } catch (error) {
            Redis.set(refreshToken, refreshToken);
            throw error;
        }
    };
}

export default AuthService;
