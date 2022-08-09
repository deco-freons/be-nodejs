import { IsString, MinLength } from "class-validator";

class LoginDTO {
    @IsString()
    @MinLength(1)
    username: string;

    @IsString()
    @MinLength(1)
    password: string;
}

export default LoginDTO