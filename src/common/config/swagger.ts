import swaggerJsDoc from 'swagger-jsdoc';

export const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'DECO3801 - Freons',
            version: '0.1.0',
            description: 'DECO3801 - Freons',
            contact: {
                name: 'Freons',
                email: 'deco-freons@outlook.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000/auth',
            },
        ],
    },
    apis: [
        './src/*/exception/*.ts',
        './src/*/controller/*.ts',
        './src/*/entity/*.ts',
        './src/*/request/*.ts',
        './src/*/response/*.ts',
    ],
};

const SwaggerJsDoc = swaggerJsDoc(swaggerOptions);

export default SwaggerJsDoc;
