import { Router, NextFunction } from 'express';
import { DataSource } from 'typeorm';

import BaseController from '../../common/controller/base.controller';
import authorizationMiddleware from '../../common/middleware/authorization.middleware';
import validationMiddleware from '../../common/middleware/validation.middleware';
import { RequestTypes } from '../../common/enum/request.enum';

// import for other service

// import untuk event service
import EventService from '../service/event.service';
import CreateEventDTO from '../dto/event.create.dto';
import CreateEventRequest from '../request/event.create.request';
import { CreateEventResponse } from '../response/event.create.response';

class EventController implements BaseController {
    path: string;
    router: Router;
    service: EventService;

    constructor(database: DataSource) {
        this.path = '/event';
        this.router = Router();
        this.service = new EventService(database);
        this.initRoutes();
    }

    private initRoutes() {
        this.router.post(
            '/create',
            [authorizationMiddleware, validationMiddleware(CreateEventDTO, RequestTypes.BODY)],
            this.createEventHandler,
        );
    }

    private createEventHandler = async (
        request: CreateEventRequest,
        response: CreateEventResponse,
        next: NextFunction,
    ) => {
        try {
            const body = request.body;
            const locals = response.locals;
            const serviceResponse = await this.service.createEvent(body, locals);
            return response.send({ statusCode: 200, message: serviceResponse.message });
        } catch (error) {
            next(error);
        }
    };
}

export default EventController;
