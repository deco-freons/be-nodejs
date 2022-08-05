import { Repository, ObjectLiteral } from 'typeorm';

interface BaseService {
    repository: Repository<ObjectLiteral>;
}

export default BaseService;
