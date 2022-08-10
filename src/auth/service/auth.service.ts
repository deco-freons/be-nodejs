import { Repository, ObjectLiteral, DataSource } from 'typeorm';

import BaseService from '../../common/service/base.service';
import JWT from '../../common/utils/jwt';
import Redis from '../../common/config/redis';
import BadRequestException from '../../common/exception/badRequest.exception';
import UnauthorizedException from '../../common/exception/unauthorized.exception';
import ExpiredTokenException from '../../common/exception/expiredToken.exception';

import Crypt from '../../common/utils/crypt';
import User from '../entity/user.entity';
import RegisterDTO from '../dto/register.dto';
import LoginDTO from '../dto/login.dto';
import RefreshTokenDTO from '../dto/refreshToken.dto';
import VerifyDTO from '../dto/verify.dto';
import LoginPayload from '../payload/login.payload';
import { TTL } from '../../common/enum/token.enum';
import { VerifyQuery } from '../request/verify.request';

class AuthService implements BaseService {
    repository: Repository<ObjectLiteral>;

    constructor(database: DataSource) {
        this.repository = database.getRepository(User);
    }

    private getUser = async (username: string, email: string) => {
        const queryBuilder = this.repository.createQueryBuilder();
        const user = await queryBuilder
            .select(['user.userID', 'user.username', 'user.email'])
            .from(User, 'user')
            .where('user.username = :username', { username: username })
            .andWhere('user.email = :email', { email: email })
            .getOne();
        return user;
    };

    private getUserByID = async (userID: number) => {
        const queryBuilder = this.repository.createQueryBuilder();
        const user = await queryBuilder
            .select(['user.userID', 'user.username', 'user.email', 'user.isVerified'])
            .from(User, 'user')
            .where('user.userID = :userID', { userID: userID })
            .getOne();
        return user;
    };

    private updateUser = async (userID: number, username: string, email: string) => {
        const queryBuilder = this.repository.createQueryBuilder();
        await queryBuilder
            .update(User)
            .set({ isVerified: true })
            .where('userID = :userID', { userID: userID })
            .andWhere('username = :username', { username: username })
            .andWhere('email = :email', { email: email })
            .execute();
    };

    private generateUrl = async (userPayload: LoginPayload, userID: string) => {
        const token = await JWT.signToken(userPayload);
        Redis.set(userID, token.secret);
        Redis.expire(userID, TTL.VERIFY_TTL);

        return `http://localhost:8000/auth/verify?token=${token.token}&userID=${userID}`;
    };

    public register = async (body: RegisterDTO) => {
        try {
            const user = await this.getUser(body.username, body.email);
            if (user) {
                throw new BadRequestException('User already exist.');
            }

            const hashedPassword = await Crypt.hash(body.password);
            await this.repository
                .createQueryBuilder()
                .insert()
                .into(User)
                .values({
                    ...body,
                    password: hashedPassword,
                })
                .execute();

            const newUser = await this.getUser(body.username, body.email);
            const userID = String(newUser.userID);
            const userPayload = {
                username: newUser.username,
                email: newUser.email,
            };
            const url = await this.generateUrl(userPayload, userID);
            console.log(url);

            return { message: 'User has been created, please check your email to verify your account.' };
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
                throw new BadRequestException('Username or password does not match.');
            }

            if (!user.isVerified) {
                const userID = String(user.userID);
                const userPayload = {
                    username: user.username,
                    email: user.email,
                };
                const url = await this.generateUrl(userPayload, userID);
                console.log(url);
                throw new UnauthorizedException(
                    'Account is not verified. Please check your email to verify your account.',
                );
            }

            const matched = await Crypt.compare(body.password, user.password);
            if (!matched) {
                throw new BadRequestException('Username or password does not match.');
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

            return { message: 'Login Successful.', userData, accessToken, refreshToken };
        } catch (error) {
            throw error;
        }
    };

    public refreshToken = async (body: RefreshTokenDTO) => {
        const refreshToken = body.refreshToken;

        try {
            const refreshTokenResponse = JWT.verifyRefreshToken(refreshToken);

            const user = await this.getUser(refreshTokenResponse.username, refreshTokenResponse.email);
            if (!user) {
                throw new UnauthorizedException('Invalid Token');
            }

            const refreshTokenRedis = await Redis.get(refreshToken);
            if (refreshTokenRedis == refreshToken) {
                throw new UnauthorizedException('Invalid Token');
            }
            Redis.set(refreshToken, refreshToken);
            Redis.expireAt(refreshToken, refreshTokenResponse.exp);

            const userPayload = {
                username: user.username,
                email: user.email,
            };
            const accessTokenNew = JWT.signAccessToken(userPayload);
            const refreshTokenNew = JWT.signRefreshToken(userPayload);

            return { message: 'Success.', accessTokenNew, refreshTokenNew };
        } catch (error) {
            throw error;
        }
    };

    public verify = async (query: VerifyQuery) => {
        try {
            const token = query.token;
            const user = await this.getUserByID(Number(query.userID));
            if (!user) {
                throw new UnauthorizedException('Invalid Token.');
            }
            if (user.isVerified) {
                return { message: 'Your account has been verified.' };
            }
            const userID = String(user.userID);

            const secret = await Redis.get(userID);
            if (secret) {
                const tokenResponse = JWT.verifyToken(token, secret);
                const tokenRedis = await Redis.get(token);
                if (tokenRedis == token) {
                    throw new ExpiredTokenException('Invalid Token. Please request new verification email.');
                }

                await this.updateUser(user.userID, tokenResponse.username, tokenResponse.email);
                Redis.set(token, token);
                Redis.expireAt(token, tokenResponse.exp);
                Redis.del(userID);

                return { message: 'Your account has been verified' };
            } else {
                throw new ExpiredTokenException('Invalid Token. Please request new verification email.');
            }
        } catch (error) {
            throw error;
        }
    };

    public requestVerify = async (body: VerifyDTO) => {
        const token = body.token;

        const user = await this.getUserByID(body.userID);
        if (!user) {
            // check user
            throw new UnauthorizedException('Invalid Token.');
        }
        if (user.isVerified) {
            // check verification status
            return { message: 'Your account has been verified.' };
        }
        const userID = String(body.userID);
        let userPayload = {
            username: user.username,
            email: user.email,
        };

        try {
            // check secret in redis
            // if exist, token is still alive
            // else, token expired, generate new token and secret
            const secret = await Redis.get(userID);
            if (secret) {
                // try to decode token
                // if not valid, throw ExpiredTokenException and generate new token and secret
                const tokenResponse = JWT.verifyToken(token, secret);
                // get token from redis
                // if exist, token still alive and already blacklisted
                // else, token need to be blacklisted
                const tokenRedis = await Redis.get(token);
                if (tokenRedis != token) {
                    Redis.set(token, token);
                    Redis.expireAt(token, tokenResponse.exp);
                }
                userPayload = {
                    username: tokenResponse.username,
                    email: tokenResponse.email,
                };
            }
        } catch (error) {
            if (!(error instanceof ExpiredTokenException)) throw error;
        }

        // generate new token
        const url = await this.generateUrl(userPayload, userID);
        console.log(url);

        return { message: 'We have resend you a new verification link, please check your email.' };
    };

    public logout = async (body: RefreshTokenDTO) => {
        const refreshToken = body.refreshToken;

        try {
            const refreshTokenResponse = JWT.verifyRefreshToken(refreshToken);

            const user = await this.getUser(refreshTokenResponse.username, refreshTokenResponse.email);
            if (!user) {
                throw new UnauthorizedException('Invalid Token.');
            }

            const refreshTokenRedis = await Redis.get(refreshToken);
            if (refreshTokenRedis == refreshToken) {
                throw new UnauthorizedException('Invalid Token.');
            }
            Redis.set(refreshToken, refreshToken);
            Redis.expireAt(refreshToken, refreshTokenResponse.exp);

            return;
        } catch (error) {
            throw error;
        }
    };
}

export default AuthService;
