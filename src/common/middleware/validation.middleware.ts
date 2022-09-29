import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { NextFunction, Request, Response } from 'express';

import { RequestTypes } from '../enum/request.enum';
import BaseException from '../exception/base.exception';

const validationMiddleware = <T>(type: ClassConstructor<T>, property: RequestTypes, skipMissingProperties = false) => {
    return (request: Request, response: Response, next: NextFunction) => {
        validate(plainToInstance<T, RequestTypes>(type, request[property]), { skipMissingProperties }).then(
            (errors: ValidationError[]) => {
                if (errors.length > 0) {
                    let message = errors
                        .map((error: ValidationError) => Object.values(error.constraints || ''))
                        .join(', ');
                    if (message == '' || message == ', ')
                        message = errors
                            .map((error: ValidationError) =>
                                error.children.map((children: ValidationError) => {
                                    if (children.children && children.children.length > 0) {
                                        return children.children.map((child: ValidationError) =>
                                            Object.values(child.constraints || ''),
                                        );
                                    } else if (children.children.length == 0) {
                                        for (const key in children.constraints) {
                                            return children.constraints[key];
                                        }
                                    } else {
                                        return 'Invalid object';
                                    }
                                }),
                            )
                            .join(', ');

                    next(new BaseException(400, message));
                } else {
                    next();
                }
            },
        );
    };
};

export default validationMiddleware;
