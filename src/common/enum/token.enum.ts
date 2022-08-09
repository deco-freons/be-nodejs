export enum Token {
    ACCESS = 'access',
    REFRESH = 'refresh',
}

export enum TokenTTL {
    ACCESS_TTL = 60 * 60,
    REFRESH_TTL = 30 * 24 * 60 * 60,
}
