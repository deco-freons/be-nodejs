import { MinLength, IsString } from 'class-validator';

class TokenDTO {
    @IsString()
    @MinLength(1)
    refreshToken: string;
}

export default TokenDTO;
