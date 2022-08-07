import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { NextFunction, Request, Response } from 'express';

import { RequestTypes } from '../config/enum/request.enum';
import BaseException from '../exception/base.exception';

const validationMiddleware = <T>(type: ClassConstructor<T>, property: RequestTypes, skipMissingProperties = false) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        validate(plainToInstance<T, RequestTypes>(type, req[property]), { skipMissingProperties }).then(
            (errors: ValidationError[]) => {
                if (errors.length > 0) {
                    const message = errors
                        .map((error: ValidationError) => Object.values(error.constraints || ''))
                        .join(', ');
                    next(new BaseException(400, message));
                } else {
                    next();
                }
            },
        );
    };
};

export default validationMiddleware
