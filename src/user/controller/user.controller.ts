import { Router, NextFunction } from 'express';
import { DataSource } from 'typeorm';

import BaseController from '../../common/controller/base.controller';
import authorizationMiddleware from '../../common/middleware/authorization.middleware';
import validationMiddleware from '../../common/middleware/validation.middleware';
import { RequestTypes } from '../../common/enum/request.enum';

import UserService from '../service/user.service';
import UserPreferenceDTO from '../dto/user.preference.dto';
import UpsertUserPreferenceRequest from '../request/upsertUserPreference.request';
import { UpsertUserPreferenceResponse } from '../response/upsertUserPreference.response';

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
            this.upsertHandler,
        );
    }

    private upsertHandler = async (
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
}

export default UserController;
