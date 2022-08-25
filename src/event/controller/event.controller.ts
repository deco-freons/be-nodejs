import { Router, NextFunction } from 'express';
import { DataSource } from 'typeorm';

import BaseController from '../../common/controller/base.controller';
import authorizationMiddleware from '../../common/middleware/authorization.middleware';
import validationMiddleware from '../../common/middleware/validation.middleware';
import { RequestTypes } from '../../common/enum/request.enum';

import EventService from '../service/event.service';
import CreateEventDTO from '../dto/event.create.dto';
import CreateEventRequest from '../request/event.create.request';
import ReadEventResponse from '../response/event.read.response';
import ReadEventDetailsDTO from '../dto/event.readDetails.dto';
import ReadEventDetailsRequest from '../request/event.readDetails.request';
import UpdateEventDTO from '../dto/event.update.dto';
import UpdateEventRequest from '../request/event.update.request';
import DeleteEventDTO from '../dto/event.delete.dto';
import DeleteEventRequest from '../request/event.delete.request';
import { ReadEventDTO, ReadEventQueryDTO } from '../dto/event.read.dto';
import { CreateEventResponse } from '../response/event.create.response';
import { ReadEventRequest } from '../request/event.read.request';
import { UpdateEventResponse } from '../response/event.update.response';
import { DeleteEventResponse } from '../response/event.delete.response';
import { ReadEventDetailsResponse } from '../response/event.readDetails.response';

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
        this.router.post(
            '/read',
            [
                authorizationMiddleware,
                validationMiddleware(ReadEventDTO, RequestTypes.BODY),
                validationMiddleware(ReadEventQueryDTO, RequestTypes.QUERY),
            ],
            this.readEventHandler,
        );
        this.router.post(
            '/read/detail',
            [authorizationMiddleware, validationMiddleware(ReadEventDetailsDTO, RequestTypes.BODY)],
            this.readEventDetailsHandler,
        );
        this.router.patch(
            '/update',
            [authorizationMiddleware, validationMiddleware(UpdateEventDTO, RequestTypes.BODY)],
            this.updateEventHandler,
        );
        this.router.delete(
            '/delete',
            [authorizationMiddleware, validationMiddleware(DeleteEventDTO, RequestTypes.BODY)],
            this.deleteEventHandler,
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

    private readEventHandler = async (request: ReadEventRequest, response: ReadEventResponse, next: NextFunction) => {
        try {
            const body = request.body;
            const query = request.query;
            const serviceResponse = await this.service.readEvent(body, query);
            return response.send({ statusCode: 200, message: serviceResponse.message, events: serviceResponse.events });
        } catch (error) {
            next(error);
        }
    };

    private readEventDetailsHandler = async (
        request: ReadEventDetailsRequest,
        response: ReadEventDetailsResponse,
        next: NextFunction,
    ) => {
        try {
            const body = request.body;
            const locals = response.locals;
            const serviceResponse = await this.service.readEventDetails(body, locals);
            return response.send({
                statusCode: 200,
                message: serviceResponse.message,
                isEventCreator: serviceResponse.isEventCreator,
                event: serviceResponse.event,
            });
        } catch (error) {
            next(error);
        }
    };

    private updateEventHandler = async (
        request: UpdateEventRequest,
        response: UpdateEventResponse,
        next: NextFunction,
    ) => {
        try {
            const body = request.body;
            const locals = response.locals;
            const serviceResponse = await this.service.updateEvent(body, locals);
            return response.send({ statusCode: 200, message: serviceResponse.message });
        } catch (error) {
            next(error);
        }
    };

    private deleteEventHandler = async (
        request: DeleteEventRequest,
        response: DeleteEventResponse,
        next: NextFunction,
    ) => {
        try {
            const body = request.body;
            const locals = response.locals;
            const serviceResponse = await this.service.deleteEvent(body, locals);
            return response.send({ statusCode: 200, message: serviceResponse.message });
        } catch (error) {
            next(error);
        }
    };
}

export default EventController;