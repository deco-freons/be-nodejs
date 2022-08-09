import { MinLength, IsString } from 'class-validator';

class RefreshTokenDTO {
    @IsString()
    @MinLength(1)
    refreshToken: string;
}

export default RefreshTokenDTO;
