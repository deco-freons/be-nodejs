import { IncomingHttpHeaders  } from 'http'
import { Request } from 'express'
import { IsString } from 'class-validator'

interface BaseRequest extends Request {
    headers           : IncomingHttpHeaders & {
        customHeader?: string
    }
}

class User {
    @IsString()
    id: string
}

interface UserRequest extends BaseRequest {
    body: User
}

export default BaseRequest
