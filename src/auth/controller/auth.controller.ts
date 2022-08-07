import { Router, NextFunction } from 'express';

import BaseController from '../../common/controller/base.controller';
import AuthService from '../service/auth.service';
import { DataSource } from 'typeorm';
import RegisterRequest from '../request/register.request';
import { RegisterResponse } from '../response/register.response';
import validationMiddleware from '../../common/middleware/validation.middleware';
import RegisterDTO from '../dto/register.dto';
import { RequestTypes } from '../../common/config/enum/request.enum';

class AuthController implements BaseController {
    path: string;
    router: Router;
    service: AuthService;

    constructor(database: DataSource) {
        this.path = '/auth';
        this.router = Router();
        this.service = new AuthService(database);
        this.initRoutes();
    }

    private initRoutes() {
        this.router.post('/register', validationMiddleware(RegisterDTO, RequestTypes.BODY), this.registerHandler);
        this.router.post('/login');
        this.router.post('/verify');
        this.router.post('/forget-password');
        this.router.post('/refresh-token');
        this.router.delete('/logout');
    }

    private registerHandler = async (request: RegisterRequest, response: RegisterResponse, next: NextFunction) => {
        try {
            const body = request.body;
            await this.service.register(body);
            return response.send();
        } catch (error) {
            next(error);
        }
    };
}

export default AuthController;
