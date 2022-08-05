import { Router } from 'express';
import BaseService from '../service/base.service';

interface BaseController {
    path: string;
    router: Router;
    service: BaseService;
}

export default BaseController;
