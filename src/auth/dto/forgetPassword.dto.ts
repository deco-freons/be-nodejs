import { IsNumber, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Match } from '../../common/decorator/match';

class ForgetPasswordDTO {
    @IsString()
    @MinLength(1)
    email: string;
}

class ForgetPasswordCompleteDTO {
    @IsNumber()
    userID: number;

    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
    password: string;

    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Match(ForgetPasswordCompleteDTO, (dto) => dto.password, { message: 'Password Does Not Match' })
    confirmPassword: string;

    @IsString()
    @MinLength(1)
    token: string;
}

export { ForgetPasswordDTO, ForgetPasswordCompleteDTO };
