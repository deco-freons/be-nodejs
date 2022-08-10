import { Router, NextFunction } from 'express';
import { DataSource } from 'typeorm';

import BaseController from '../../common/controller/base.controller';
import validationMiddleware from '../../common/middleware/validation.middleware';
import { RequestTypes } from '../../common/enum/request.enum';

import AuthService from '../service/auth.service';
import RegisterDTO from '../dto/register.dto';
import RegisterRequest from '../request/register.request';
import RegisterResponse from '../response/register.response';
import LoginDTO from '../dto/login.dto';
import LoginRequest from '../request/login.request';
import LoginResponse from '../response/login.response';
import RefreshTokenDTO from '../dto/refreshToken.dto';
import RefreshTokenRequest from '../request/refreshToken.request';
import RefreshTokenResponse from '../response/refreshToken.response';
import VerifyDTO from '../dto/verify.dto';
import VerifyRequest from '../request/verify.request';
import VerifyResponse from '../response/verify.response';
import { ForgetPasswordCompleteDTO, ForgetPasswordDTO } from '../dto/forgetPassword.dto';
import { ForgetPasswordCompleteRequest, ForgetPasswordRequest } from '../request/forgetPassword.request';
import { ForgetPasswordCompleteResponse, ForgetPasswordResponse } from '../response/forgetPassword.response';

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
        this.router.post('/verify', validationMiddleware(VerifyDTO, RequestTypes.BODY), this.verifyHandler);
        this.router.post(
            '/verify/request',
            validationMiddleware(VerifyDTO, RequestTypes.BODY),
            this.requestVerifyHandler,
        );
        this.router.post(
            '/forget-password',
            validationMiddleware(ForgetPasswordCompleteDTO, RequestTypes.BODY),
            this.forgetPassword,
        );
        this.router.post(
            '/forget-password/request',
            validationMiddleware(ForgetPasswordDTO, RequestTypes.BODY),
            this.requestForgetPassword,
        );
        this.router.post(
            '/refresh-token',
            validationMiddleware(RefreshTokenDTO, RequestTypes.BODY),
            this.refreshTokenHandler,
        );
        this.router.delete('/logout', validationMiddleware(RefreshTokenDTO, RequestTypes.BODY), this.logoutHandler);
    }

    private registerHandler = async (request: RegisterRequest, response: RegisterResponse, next: NextFunction) => {
        try {
            const body = request.body;
            const serviceResponse = await this.service.register(body);
            return response.send({ statusCode: 201, message: serviceResponse.message });
        } catch (error) {
            next(error);
        }
    };

    private loginHandler = async (request: LoginRequest, response: LoginResponse, next: NextFunction) => {
        try {
            const body = request.body;
            const serviceResponse = await this.service.login(body);
            return response.send({
                statusCode: 200,
                message: serviceResponse.message,
                user: serviceResponse.userData,
                accessToken: serviceResponse.accessToken,
                refreshToken: serviceResponse.refreshToken,
            });
        } catch (error) {
            next(error);
        }
    };

    private verifyHandler = async (request: VerifyRequest, response: VerifyResponse, next: NextFunction) => {
        try {
            const body = request.body;
            const serviceResponse = await this.service.verify(body);
            return response.send({ statusCode: 200, message: serviceResponse.message });
        } catch (error) {
            next(error);
        }
    };

    private requestVerifyHandler = async (request: VerifyRequest, response: VerifyResponse, next: NextFunction) => {
        try {
            const body = request.body;
            const serviceResponse = await this.service.requestVerify(body);
            return response.send({ statusCode: 200, message: serviceResponse.message });
        } catch (error) {
            next(error);
        }
    };

    private forgetPassword = async (
        request: ForgetPasswordCompleteRequest,
        response: ForgetPasswordCompleteResponse,
        next: NextFunction,
    ) => {
        try {
            const body = request.body;
            const serviceResponse = await this.service.forgetPassword(body);
            return response.send({ statusCode: 200, message: serviceResponse.message });
        } catch (error) {
            next(error);
        }
    };

    private requestForgetPassword = async (
        request: ForgetPasswordRequest,
        response: ForgetPasswordResponse,
        next: NextFunction,
    ) => {
        try {
            const body = request.body;
            const serviceResponse = await this.service.requestForgetPassword(body);
            return response.send({ statusCode: 200, message: serviceResponse.message });
        } catch (error) {
            next(error);
        }
    };

    private refreshTokenHandler = async (
        request: RefreshTokenRequest,
        response: RefreshTokenResponse,
        next: NextFunction,
    ) => {
        try {
            const body = request.body;
            const serviceResponse = await this.service.refreshToken(body);
            return response.send({
                statusCode: 200,
                message: serviceResponse.message,
                accessToken: serviceResponse.accessTokenNew,
                refreshToken: serviceResponse.refreshTokenNew,
            });
        } catch (error) {
            next(error);
        }
    };

    private logoutHandler = async (
        request: RefreshTokenRequest,
        response: RefreshTokenResponse,
        next: NextFunction,
    ) => {
        try {
            const body = request.body;
            await this.service.logout(body);
            return response.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}

export default AuthController;
