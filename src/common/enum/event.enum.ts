enum UNIX {
    ONE_DAY = 86400,
    MILLI_SECONDS = 1000,
}

enum SORT_BY {
    POPULARITY = 'POPULARITY',
    DISTANCE = 'DISTANCE',
    DAYS_TO_EVENT = 'DAYS_TO_EVENT',
}

const EVENT = {
    CATEGORIES: ['GM', 'MV', 'DC', 'CL', 'BB', 'NT', 'FB'] as const,
    DAYS_TO_EVENT: [1, 7, 14, 21, 28] as const,
    RADIUS: [5, 10, 20] as const,
    SORT_BY: Object.values(SORT_BY),
    DAY: 86400 as const,
};

export { EVENT, SORT_BY, UNIX };
