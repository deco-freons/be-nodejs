import { IsIn, IsOptional, IsString } from 'class-validator';

class NumericFilterDTO {
    @IsString()
    @IsIn(['MORE', 'LESS'], { each: true })
    @IsOptional()
    isMoreOrLess: string;
}

export { NumericFilterDTO };
