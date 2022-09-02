import { Router, NextFunction } from 'express';
import { DataSource } from 'typeorm';

import BaseController from '../../common/controller/base.controller';
import authorizationMiddleware from '../../common/middleware/authorization.middleware';
import validationMiddleware from '../../common/middleware/validation.middleware';
import { RequestTypes } from '../../common/enum/request.enum';

import AuthService from '../service/auth.service';
import RegisterDTO from '../dto/register.dto';
import RegisterRequest from '../request/register.request';
import RegisterResponse from '../response/register.response';
import LoginDTO from '../dto/login.dto';
import LoginRequest from '../request/login.request';
import LoginResponse from '../response/login.response';
import TokenDTO from '../dto/token.dto';
import TokenRequest from '../request/token.request';
import VerifyDTO from '../dto/verify.dto';
import VerifyRequest from '../request/verify.request';
import VerifyResponse from '../response/verify.response';
import { TokenResponse } from '../response/token.response';
import { ForgetPasswordCompleteDTO, ForgetPasswordDTO } from '../dto/forgetPassword.dto';
import { ForgetPasswordRequestRequest, ForgetPasswordRequest } from '../request/forgetPassword.request';
import { ForgetPasswordRequestResponse, ForgetPasswordResponse } from '../response/forgetPassword.response';

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
        this.router.patch(
            '/forget-password',
            validationMiddleware(ForgetPasswordCompleteDTO, RequestTypes.BODY),
            this.forgetPassword,
        );
        this.router.post(
            '/forget-password/request',
            validationMiddleware(ForgetPasswordDTO, RequestTypes.BODY),
            this.requestForgetPassword,
        );
        this.router.post('/access-token', authorizationMiddleware, this.accessTokenHandler);
        this.router.post('/refresh-token', validationMiddleware(TokenDTO, RequestTypes.BODY), this.refreshTokenHandler);
        this.router.delete('/logout', validationMiddleware(TokenDTO, RequestTypes.BODY), this.logoutHandler);
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
        request: ForgetPasswordRequest,
        response: ForgetPasswordResponse,
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
        request: ForgetPasswordRequestRequest,
        response: ForgetPasswordRequestResponse,
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

    private accessTokenHandler = async (_request: TokenRequest, response: TokenResponse, next: NextFunction) => {
        try {
            const locals = response.locals;
            const serviceResponse = await this.service.accessToken(locals);
            return response.send({
                statusCode: 200,
                message: serviceResponse.message,
                isAuthenticated: serviceResponse.isLogin,
                user: serviceResponse.userData,
            });
        } catch (error) {
            next(error);
        }
    };

    private refreshTokenHandler = async (request: TokenRequest, response: TokenResponse, next: NextFunction) => {
        try {
            const body = request.body;
            const serviceResponse = await this.service.refreshToken(body);
            return response.send({
                statusCode: 200,
                message: serviceResponse.message,
                isAuthenticated: serviceResponse.isAuthenticated,
                user: serviceResponse.userData,
                accessToken: serviceResponse.accessToken,
                refreshToken: serviceResponse.refreshToken,
            });
        } catch (error) {
            next(error);
        }
    };

    private logoutHandler = async (request: TokenRequest, response: TokenResponse, next: NextFunction) => {
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
