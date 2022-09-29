import { IsNumber, IsString } from 'class-validator';

class PriceDTO {
    @IsNumber()
    fee: number;

    @IsString()
    currency: string;
}

export default PriceDTO;
