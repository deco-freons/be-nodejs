import { IsArray, IsIn, IsOptional } from 'class-validator';
import { EVENT } from '../enum/event.enum';

class StatusDTO {
    @IsArray()
    @IsIn(EVENT.STATUS, { each: true })
    @IsOptional()
    status: string[];
}

export default StatusDTO;
