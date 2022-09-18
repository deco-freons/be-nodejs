import aws from 'aws-sdk';
import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const credentials = {
    region: 'ap-southeast-2',
    credentials: {
        secretAccessKey: process.env.S3_ACCESS_KEY_SECRET,
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
    },
};

aws.config.update(credentials);

const S3 = new S3Client(credentials);

export default S3;
