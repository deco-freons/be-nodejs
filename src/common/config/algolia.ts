import algoliasearch from 'algoliasearch';
import dotenv from 'dotenv';

dotenv.config();

const Algolia = algoliasearch(process.env.ALGOLIA_APPLICATION_ID, process.env.ALGOLIA_ADMIN_KEY);

export default Algolia;
