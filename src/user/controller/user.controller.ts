import { Router, NextFunction } from 'express';
import { DataSource } from 'typeorm';

import BaseController from '../../common/controller/base.controller';
import authorizationMiddleware from '../../common/middleware/authorization.middleware';
import imageUploadMiddleware from '../../common/middleware/imageUpload.middleware';
import validationMiddleware from '../../common/middleware/validation.middleware';
import { RequestTypes } from '../../common/enum/request.enum';

import UserService from '../service/user.service';
import UserPreferenceDTO from '../dto/user.preference.dto';
import UpsertUserPreferenceRequest from '../request/userPreference.upsert.request';
import ReadUserRequest from '../request/user.read.request';
import UserOtherDTO from '../dto/user.others.dto';
import UpdateUserDTO from '../dto/user.update.dto';
import UpdateUserRequest from '../request/user.update.request';
import UserLongLatDTO from '../dto/user.longlat.dto';
import UserEventsRequest from '../request/user.events.request';
import ReadOtherUserRequest from '../request/user.others.request';
import UserImageDTO from '../dto/user.image.dto';
import UserImageRequest from '../request/user.image.request';
import { UpsertUserPreferenceResponse } from '../response/userPreference.upsert.response';
import { ReadUserResponse } from '../response/user.read.response';
import { UpdateUserResponse } from '../response/user.update.response';
import { UserEventsResponse } from '../response/user.events.response';
import { ReadOtherUserResponse } from '../response/user.others.response';
import { UserImageResponse } from '../response/user.image.response';

class UserController implements BaseController {
    path: string;
    router: Router;
    service: UserService;

    constructor(database: DataSource) {
        this.path = '/user';
        this.router = Router();
        this.service = new UserService(database);
        this.initRoutes();
    }

    private initRoutes() {
        this.router.post(
            '/preference/upsert',
            [authorizationMiddleware, validationMiddleware(UserPreferenceDTO, RequestTypes.BODY)],
            this.upsertUserPreferenceHandler,
        );
        this.router.get('/read', authorizationMiddleware, this.readUserHandler);
        this.router.post(
            '/read/other',
            [authorizationMiddleware, validationMiddleware(UserOtherDTO, RequestTypes.BODY)],
            this.readOtherUserHandler,
        );
        this.router.post(
            '/update',
            [authorizationMiddleware, validationMiddleware(UpdateUserDTO, RequestTypes.BODY)],
            this.updateUserHandler,
        );
        this.router.post(
            '/events',
            [authorizationMiddleware, validationMiddleware(UserLongLatDTO, RequestTypes.BODY)],
            this.readEventsByUserHandler,
        );
        this.router.post(
            '/image',
            [
                authorizationMiddleware,
                imageUploadMiddleware.single('userImage'),
                validationMiddleware(UserImageDTO, RequestTypes.BODY),
            ],
            this.uploadUserImageHandler,
        );
    }

    private upsertUserPreferenceHandler = async (
        request: UpsertUserPreferenceRequest,
        response: UpsertUserPreferenceResponse,
        next: NextFunction,
    ) => {
        try {
            const body = request.body;
            const locals = response.locals;
            const serviceResponse = await this.service.upsertUserPreference(body, locals);
            return response.send({ statusCode: 200, message: serviceResponse.message });
        } catch (error) {
            next(error);
        }
    };

    private readUserHandler = async (_request: ReadUserRequest, response: ReadUserResponse, next: NextFunction) => {
        try {
            const locals = response.locals;
            const serviceResponse = await this.service.readUser(locals);
            return response.send({ statusCode: 200, message: serviceResponse.message, user: serviceResponse.userData });
        } catch (error) {
            next(error);
        }
    };

    private readOtherUserHandler = async (
        request: ReadOtherUserRequest,
        response: ReadOtherUserResponse,
        next: NextFunction,
    ) => {
        try {
            const body = request.body;
            const serviceResponse = await this.service.readOtherUser(body);
            return response.send({ statusCode: 200, message: serviceResponse.message, user: serviceResponse.userData });
        } catch (error) {
            next(error);
        }
    };

    private updateUserHandler = async (
        request: UpdateUserRequest,
        response: UpdateUserResponse,
        next: NextFunction,
    ) => {
        try {
            const body = request.body;
            const locals = response.locals;
            const serviceResponse = await this.service.updateUser(body, locals);
            return response.send({ statusCode: 200, message: serviceResponse.message, user: serviceResponse.userData });
        } catch (error) {
            next(error);
        }
    };

    private readEventsByUserHandler = async (
        request: UserEventsRequest,
        response: UserEventsResponse,
        next: NextFunction,
    ) => {
        try {
            const body = request.body;
            const locals = response.locals;
            const serviceResponse = await this.service.readEventsByUser(body, locals);
            return response.send({ statusCode: 200, message: serviceResponse.message, events: serviceResponse.events });
        } catch (error) {
            next(error);
        }
    };

    private uploadUserImageHandler = async (
        request: UserImageRequest,
        response: UserImageResponse,
        next: NextFunction,
    ) => {
        try {
            const files = request.file as Express.MulterS3.File;
            const locals = response.locals;

            console.log(request.file);

            const serviceResponse = await this.service.uploadUserImage(files, locals);
            return response.send({ statusCode: 200, message: serviceResponse.message });
        } catch (error) {
            next(error);
        }
    };
}

export default UserController;
