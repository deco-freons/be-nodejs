import { Router, NextFunction } from 'express';
import { DataSource } from 'typeorm';

import BaseController from '../../common/controller/base.controller';
import validationMiddleware from '../../common/middleware/validation.middleware';
import { RequestTypes } from '../../common/enum/request.enum';

import AuthService from '../service/auth.service';
import RegisterRequest from '../request/register.request';
import RegisterDTO from '../dto/register.dto';
import LoginRequest from '../request/login.request';
import LoginDTO from '../dto/login.dto';
import { RegisterResponse } from '../response/register.response';
import { LoginResponse } from '../response/login.response';

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
        this.router.post('/login', validationMiddleware(LoginDTO, RequestTypes.BODY), this.loginHandler);
        this.router.post('/verify');
        this.router.post('/forget-password');
        this.router.post('/refresh-token');
        this.router.delete('/logout');
    }

    private registerHandler = async (request: RegisterRequest, response: RegisterResponse, next: NextFunction) => {
        try {
            const body = request.body;
            const message = await this.service.register(body);
            return response.send({ statusCode: 201, message: message });
        } catch (error) {
            next(error);
        }
    };

    private loginHandler = async (request: LoginRequest, response: LoginResponse, next: NextFunction) => {
        try {
            const body = request.body;
            const user = await this.service.login(body);
            return response.send({
                statusCode: 200,
                message: user.message,
                user: user.userData,
                accessToken: user.accessToken,
                refreshToken: user.refreshToken,
            });
        } catch (error) {
            next(error);
        }
    };
}

export default AuthController;
