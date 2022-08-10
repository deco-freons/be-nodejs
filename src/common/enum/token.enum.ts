export enum Token {
    ACCESS = 'access',
    REFRESH = 'refresh',
}

export enum TTL {
    ACCESS_TOKEN_TTL = 60 * 60,
    REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60,
    VERIFY_TTL = 24 * 60 * 60,
    FORGET_PASSWORD_TTL = 60 * 60,
}
