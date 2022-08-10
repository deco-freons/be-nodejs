import { IsNumberString, IsString, MinLength } from 'class-validator';

class VerifyDTO {
    @IsNumberString()
    userID: number;

    @IsString()
    @MinLength(1)
    token: string;
}

export default VerifyDTO;
