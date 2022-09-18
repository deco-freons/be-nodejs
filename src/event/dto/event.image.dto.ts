import { IsNumberString } from 'class-validator';

class UploadEventImageDTO {
    @IsNumberString()
    eventID: string;

    eventImage: string;
}

export default UploadEventImageDTO;
