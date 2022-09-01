import { IsBoolean, IsEmail, IsISO8601, IsNumber, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Match } from '../../common/decorator/match';

class RegisterDTO {
    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Matches(/^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/)
    username: string;

    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
    password: string;

    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Match(RegisterDTO, (dto) => dto.password, { message: 'Password Does Not Match' })
    confirmPassword: string;

    @IsISO8601({ strict: true })
    birthDate: string;

    @IsNumber()
    location: number;

    @IsBoolean()
    isShareLocation: boolean;
}

export default RegisterDTO;
