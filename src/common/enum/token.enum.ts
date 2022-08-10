export enum Token {
    ACCESS = 'access',
    REFRESH = 'refresh',
}

export enum TTL {
    ACCESS_TOKEN_TTL = 60 * 60,
    REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60,
    VERIFY_TTL = 24 * 60 * 60,
}

// tiap user beda secretnya
// create token using those secret
// secret masukkin redis with key value token:secret
// get secret, coba decode
// if success get user
// check user, if not exist, throw error
// if exist, change verified to true, save
// delete dari redis key valuenya, return message