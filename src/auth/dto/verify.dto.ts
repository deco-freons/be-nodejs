import { IsNumber, IsString, MinLength } from 'class-validator';

class VerifyDTO {
    @IsNumber()
    userID: number;

    @IsString()
    @MinLength(1)
    token: string;
}

export default VerifyDTO;
