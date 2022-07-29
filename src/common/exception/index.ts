import { ObjectLiteral, Repository } from "typeorm";

interface BaseRepository {
    repository: Repository<ObjectLiteral>
}

interface BaseService {
    repository: BaseRepository
}
