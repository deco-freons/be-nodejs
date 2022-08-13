import dotenv from 'dotenv';
import App from './app';

dotenv.config();

const app = new App(process.env.ENV ?? 'ENV');
app.listen();
