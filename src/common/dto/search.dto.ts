import { IsString } from 'class-validator';

class SearchDTO {
    @IsString()
    keyword: string;
}

export default SearchDTO;
