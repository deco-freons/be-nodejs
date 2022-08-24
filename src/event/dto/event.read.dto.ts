import { IsIn, IsOptional } from 'class-validator';

class ReadEventDTO {
    @IsIn(['GM', 'MV', 'DC', 'CL', 'BB', 'NT', 'FB'], { each: true })
    @IsOptional()
    categories: string[];
}

export default ReadEventDTO;
