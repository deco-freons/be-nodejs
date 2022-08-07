import { Repository, ObjectLiteral, DataSource } from 'typeorm';

import log from '../../common/logger/logger';
import BaseService from '../../common/service/base.service';
import { hashPassword } from '../../common/utils/hash';

import User from '../entity/user.entity';
import RegisterDTO from '../dto/register.dto';
import BadRequestException from '../../common/exception/badRequest.exception';
import { isQueryFailedError } from '../../common/utils/queryFailed';
import InternalServerErrorException from '../../common/exception/internalError.exception';

class AuthService implements BaseService {
    repository: Repository<ObjectLiteral>;

    constructor(database: DataSource) {
        this.repository = database.getRepository(User);
    }

    public register = async (body: RegisterDTO) => {
        try {
            // throw new UnauthorizedException();
            const hashedPassword = await hashPassword(body.password);
            await this.repository
                .createQueryBuilder()
                .insert()
                .into(User)
                .values({
                    ...body,
                    password: hashedPassword,
                })
                .execute();
            log.info(hashedPassword);
            log.info(body);
        } catch (error) {
            if (isQueryFailedError(error)) throw new BadRequestException(error['detail']);
            throw new InternalServerErrorException();
        }
    };
}

export default AuthService;
