import handlerbars from 'handlebars';
import { Repository, ObjectLiteral, DataSource } from 'typeorm';

import Mailer from '../../common/config/mailer';
import Redis from '../../common/config/redis';
import BadRequestException from '../../common/exception/badRequest.exception';
import ConflictException from '../../common/exception/conflict.exception';
import ExpiredTokenException from '../../common/exception/expiredToken.exception';
import InternalServerErrorException from '../../common/exception/internalError.exception';
import NotFoundException from '../../common/exception/notFound.exception';
import UnauthorizedException from '../../common/exception/unauthorized.exception';
import BaseService from '../../common/service/base.service';
import Crypt from '../../common/utils/crypt';
import FileSystem from '../../common/utils/fs';
import JWT from '../../common/utils/jwt';
import { EMAIL } from '../../common/enum/email.enum';
import { TTL } from '../../common/enum/token.enum';

import Preference from '../../common/entity/preference.entity';
import Location from '../../location/entity/location.entity';

import User from '../entity/user.entity';
import UserDTO from '../dto/user.dto';
import RegisterDTO from '../dto/register.dto';
import LoginDTO from '../dto/login.dto';
import TokenDTO from '../dto/token.dto';
import VerifyDTO from '../dto/verify.dto';
import UserPayload from '../payload/login.payload';
import { TokenResponseLocals } from '../response/token.response';
import { ForgetPasswordDTO, ForgetPasswordCompleteDTO } from '../dto/forgetPassword.dto';

class AuthService implements BaseService {
    userRepository: Repository<ObjectLiteral>;
    locationRepository: Repository<ObjectLiteral>;

    constructor(database: DataSource) {
        this.userRepository = database.getRepository(User);
        this.locationRepository = database.getRepository(Location);
    }

    public register = async (body: RegisterDTO) => {
        try {
            const user = await this.getUserByEmailAndUsername(body.email, body.username);
            if (user) throw new ConflictException('User already exist.');

            const hashedPassword = await Crypt.hash(body.password);
            const location = await this.getLocation(body.location);
            await this.createUser(body, hashedPassword, location);

            const newUser = await this.getUserByEmailAndUsername(body.email, body.username);
            const userID = String(newUser.userID);
            const userPayload = {
                username: newUser.username,
                email: newUser.email,
                isVerified: newUser.isVerified,
            };
            const url = await this.generateUrl(userPayload, userID, 'verify');
            this.sendEmail(url, __dirname + EMAIL.VERIFY, newUser.email, EMAIL.VERIFY_SUBJECT);

            return { message: 'User has been created. We have send you a verification link at your email address.' };
        } catch (error) {
            throw error;
        }
    };

    public login = async (body: LoginDTO) => {
        try {
            const user = await this.getUserByUsername(body.username);

            if (!user) throw new BadRequestException('Username or password does not match.');

            if (!user.isVerified)
                throw new UnauthorizedException('Your account has not been verified yet, please verify first.');

            const matched = await Crypt.compare(body.password, user.password);
            if (!matched) throw new BadRequestException('Username or password does not match.');

            let locationData: Partial<Location>;
            if (user.location) {
                locationData = this.constructLocationData(user.location);
            }

            const preferences = await this.getUserPreferences(user);
            const userData = this.constructUserData(user, preferences, locationData);

            const userPayload = {
                username: user.username,
                email: user.email,
                isVerified: user.isVerified,
            };
            const accessToken = JWT.signAccessToken(userPayload);
            const refreshToken = JWT.signRefreshToken(userPayload);

            if (user.isFirstLogin) await this.updateUserIsFirstLogin(user.userID);

            return { message: 'Login Successful.', userData, accessToken, refreshToken };
        } catch (error) {
            throw error;
        }
    };

    public verify = async (body: VerifyDTO) => {
        try {
            const token = body.token;
            const user = await this.getUserByID(Number(body.userID));
            if (!user) throw new UnauthorizedException('Invalid Token.');
            if (user.isVerified) return { message: 'Your account has been verified.' };
            const userID = String(user.userID);

            const secret = await Redis.get(userID);
            if (secret) {
                const tokenResponse = JWT.verifyToken(token, secret);
                const tokenRedis = await Redis.get(token);
                if (tokenRedis == token)
                    throw new ExpiredTokenException('Invalid Token. Please request a new verification link.');

                await this.verifyUser(user.userID, tokenResponse.username, tokenResponse.email);
                Redis.set(token, token);
                Redis.expireAt(token, tokenResponse.exp);
                Redis.del(userID);

                return { message: 'Your account has been verified' };
            } else {
                throw new ExpiredTokenException('Invalid Token. Please request a new verification link.');
            }
        } catch (error) {
            throw error;
        }
    };

    public requestVerify = async (body: VerifyDTO) => {
        let message = 'We have resend you a new verification link at your email address.';
        const token = body.token;

        const user = await this.getUserByID(body.userID);
        if (!user) throw new UnauthorizedException('Invalid Token.');
        if (user.isVerified) {
            message = 'Your account has been verified.';
            return { message };
        }
        const userID = String(body.userID);
        let userPayload = {
            username: user.username,
            email: user.email,
            isVerified: user.isVerified,
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
                    isVerified: tokenResponse.isVerified,
                };
            }
        } catch (error) {
            if (!(error instanceof ExpiredTokenException)) throw error;
        }

        const url = await this.generateUrl(userPayload, userID, 'verify');
        this.sendEmail(url, __dirname + EMAIL.VERIFY, user.email, EMAIL.VERIFY_SUBJECT);

        return { message };
    };

    public forgetPassword = async (body: ForgetPasswordCompleteDTO) => {
        try {
            const user = await this.getUserByID(body.userID);
            if (!user) throw new NotFoundException('User does not exist.');

            const userID = String(user.userID);
            if (!user.isVerified) {
                Redis.del(userID);
                throw new UnauthorizedException('Your account has not been verified yet, please verify first.');
            }

            const secretTokenPair = await Redis.hGetAll(userID);
            if (!secretTokenPair) throw new ExpiredTokenException('Please request a new link.');
            if (body.token != secretTokenPair.token) throw new UnauthorizedException('Token invalid.');

            const tokenRedis = await Redis.get(body.token);
            if (tokenRedis) throw new ExpiredTokenException('Please request a new link.');

            const tokenResponse = JWT.verifyToken(body.token, secretTokenPair.secret);

            const hashedPassword = await Crypt.hash(body.password);
            await this.updateUserPassword(user.userID, hashedPassword);
            Redis.set(body.token, body.token);
            Redis.expireAt(body.token, tokenResponse.exp);
            Redis.del(userID);

            return { message: 'You have successfully change your password.' };
        } catch (error) {
            throw error;
        }
    };

    public requestForgetPassword = async (body: ForgetPasswordDTO) => {
        const message =
            ' If your email address exists in our database, you will receive a password recovery link at your email address.';

        const email = body.email;
        const user = await this.getUserByEmail(email);
        if (!user) return { message: message };

        const userID = String(user.userID);
        const userPayload = {
            username: user.username,
            email: user.email,
            isVerified: user.isVerified,
        };

        try {
            if (!user.isVerified)
                throw new UnauthorizedException('Your account has not been verified yet, please verify first.');

            const secretTokenPair = await Redis.hGetAll(userID);
            if (secretTokenPair) {
                const tokenResponse = JWT.verifyToken(secretTokenPair.token, secretTokenPair.secret);
                Redis.set(secretTokenPair.token, secretTokenPair.token);
                Redis.expireAt(secretTokenPair.token, tokenResponse.exp);
            }
        } catch (error) {
            if (!(error instanceof ExpiredTokenException)) throw error;
        }

        const url = await this.generateUrl(userPayload, String(user.userID), 'forget-password');
        this.sendEmail(url, __dirname + EMAIL.FORGET_PASSWORD, user.email, EMAIL.FORGET_PASSWORD_SUBJECT);
        return { message: message };
    };

    public accessToken = async (locals: TokenResponseLocals) => {
        try {
            const email = locals.email;
            const username = locals.username;
            const user = await this.getUserByEmailAndUsername(email, username);
            if (!user) throw new NotFoundException('User does not exist.');

            let locationData: Partial<Location>;
            if (user.location) {
                locationData = this.constructLocationData(user.location);
            }

            const preferences = await this.getUserPreferences(user);
            const userData = this.constructUserData(user, preferences, locationData);

            return {
                message: 'Success.',
                isLogin: true,
                userData: userData,
            };
        } catch (error) {
            throw error;
        }
    };

    public refreshToken = async (body: TokenDTO) => {
        const refreshToken = body.refreshToken;

        try {
            const refreshTokenResponse = JWT.verifyRefreshToken(refreshToken);

            const user = await this.getUserByEmailAndUsername(
                refreshTokenResponse.email,
                refreshTokenResponse.username,
            );
            if (!user) throw new UnauthorizedException('Invalid Token');

            const refreshTokenRedis = await Redis.get(refreshToken);
            if (refreshTokenRedis == refreshToken) throw new UnauthorizedException('Invalid Token');
            Redis.set(refreshToken, refreshToken);
            Redis.expireAt(refreshToken, refreshTokenResponse.exp);

            const userPayload = {
                username: user.username,
                email: user.email,
                isVerified: user.isVerified,
            };
            const accessTokenNew = JWT.signAccessToken(userPayload);
            const refreshTokenNew = JWT.signRefreshToken(userPayload);

            let locationData: Partial<Location>;
            if (user.location) {
                locationData = this.constructLocationData(user.location);
            }

            const preferences = await this.getUserPreferences(user);
            const userData = this.constructUserData(user, preferences, locationData);

            return {
                message: 'Success.',
                isAuthenticated: true,
                userData: userData,
                accessToken: accessTokenNew,
                refreshToken: refreshTokenNew,
            };
        } catch (error) {
            throw error;
        }
    };

    public logout = async (body: TokenDTO) => {
        const refreshToken = body.refreshToken;

        try {
            const refreshTokenResponse = JWT.verifyRefreshToken(refreshToken);

            const user = await this.getUserByEmailAndUsername(
                refreshTokenResponse.email,
                refreshTokenResponse.username,
            );
            if (!user) throw new UnauthorizedException('Invalid Token.');

            const refreshTokenRedis = await Redis.get(refreshToken);
            if (refreshTokenRedis == refreshToken) throw new UnauthorizedException('Invalid Token.');
            Redis.set(refreshToken, refreshToken);
            Redis.expireAt(refreshToken, refreshTokenResponse.exp);

            return;
        } catch (error) {
            throw error;
        }
    };

    private constructUserData = (user: User, preferences: Preference[], location?: Partial<Location>) => {
        const userData: Partial<UserDTO> = {
            userID: user.userID,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            birthDate: user.birthDate,
            location: location,
            preferences: preferences,
            isVerified: user.isVerified,
            isFirstLogin: user.isFirstLogin,
            isShareLocation: user.isShareLocation,
        };
        return userData;
    };

    private constructLocationData = (location: Location) => {
        const locationData: Partial<Location> = {
            suburb: location.suburb,
        };
        return locationData;
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
            .orWhere('user.username = :username', { username: username })
            .getOne();
        return user as User;
    };

    private getUserByID = async (userID: number) => {
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
            .where('user.userID = :userID', { userID: userID })
            .getOne();
        return user as User;
    };

    private getUserByEmail = async (email: string) => {
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
            .getOne();
        return user as User;
    };

    private getUserByUsername = async (username: string) => {
        const queryBuilder = this.userRepository.createQueryBuilder('user');
        const user = await queryBuilder
            .select([
                'user.userID',
                'user.username',
                'user.firstName',
                'user.lastName',
                'user.email',
                'user.password',
                'user.birthDate',
                'location.suburb',
                'user.isVerified',
                'user.isFirstLogin',
                'user.isShareLocation',
            ])
            .leftJoin('user.location', 'location')
            .where('user.username = :username', { username: username })
            .getOne();
        return user as User;
    };

    private getUserPreferences = async (user: User) => {
        const queryBuilder = this.userRepository.createQueryBuilder();
        const preferences = await queryBuilder.relation(User, 'preferences').of(user).loadMany();
        return preferences;
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

    private createUser = async (body: RegisterDTO, hashedPassword: string, location: Location) => {
        const queryBuilder = this.userRepository.createQueryBuilder();
        await queryBuilder
            .insert()
            .into(User)
            .values({
                ...body,
                location: location,
                password: hashedPassword,
            })
            .execute();
    };

    private updateUserPassword = async (userID: number, hashedPassword: string) => {
        const queryBuilder = this.userRepository.createQueryBuilder();
        await queryBuilder
            .update(User)
            .set({ password: hashedPassword })
            .where('userID = :userID', { userID: userID })
            .execute();
    };

    private updateUserIsFirstLogin = async (userID: number) => {
        const queryBuilder = this.userRepository.createQueryBuilder();
        await queryBuilder
            .update(User)
            .set({ isFirstLogin: false })
            .where('userID = :userID', { userID: userID })
            .execute();
    };

    private verifyUser = async (userID: number, username: string, email: string) => {
        const queryBuilder = this.userRepository.createQueryBuilder();
        await queryBuilder
            .update(User)
            .set({ isVerified: true })
            .where('userID = :userID', { userID: userID })
            .andWhere('username = :username', { username: username })
            .andWhere('email = :email', { email: email })
            .execute();
    };

    private generateUrl = async (userPayload: UserPayload, userID: string, endpoint: string) => {
        const token = await JWT.signToken(userPayload, endpoint);
        if (endpoint == 'verify') {
            Redis.set(userID, token.secret);
            Redis.expire(userID, TTL.VERIFY_TTL);
        } else {
            const tokenSecretPair = {
                secret: token.secret,
                token: token.token,
            };
            Redis.hSet(userID, tokenSecretPair);
            Redis.expire(userID, TTL.FORGET_PASSWORD_TTL);
        }

        return `${process.env.ORIGIN}/${endpoint}?token=${token.token}&userID=${userID}`;
    };

    private sendEmail = async (url: string, path: string, email: string, subject: string) => {
        const file = await FileSystem.ReadFile(path);
        const template = handlerbars.compile(file);
        const replacements = {
            url: url,
        };
        const html = template(replacements);
        const mailOptions = {
            from: process.env.MAILER_USER,
            to: email,
            subject: subject,
            html: html,
        };
        Mailer.sendMail(mailOptions, function (error) {
            if (error) {
                throw new InternalServerErrorException('Mail Error.');
            }
        });
        return;
    };
}

export default AuthService;
