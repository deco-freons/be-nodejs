import multer, { FileFilterCallback } from 'multer';
import multerS3 from 'multer-s3';

import S3 from '../config/s3';
import { BaseRequest } from '../request/base.request';

const fileFilter = (request: BaseRequest, file: Express.Multer.File, callback: FileFilterCallback) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        callback(null, true);
    } else {
        callback(null, false);
    }
};

const imageUploadMiddleware = multer({
    fileFilter,
    storage: multerS3({
        s3: S3,
        bucket: process.env.S3_BUCKET_NAME,
        metadata: function (request: BaseRequest, file: Express.Multer.File, callback) {
            callback(null, { fieldName: file.fieldname, key: `${Date.now().toString()}-${file.originalname}` });
        },
        key: function (request: BaseRequest, file: Express.Multer.File, callback) {
            callback(null, `${Date.now().toString()}-${file.originalname}`);
        },
    }),
    limits: {
        fileSize: 1024 * 1024 * 3,
    },
});

export default imageUploadMiddleware;
