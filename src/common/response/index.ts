
import { Response } from 'express'

interface BaseResponse extends Response {
    requestTime: Date,
}

export default BaseResponse
