import dotenv from 'dotenv';

dotenv.config();

interface Config {
    port : number;
    MONGO_CONNECTION_URL : string
    JWT_SECRET : string
    env : string
    REDIS_URL:string
}
const config : Config = {
    port : Number(process.env.PORT) || 5010,
    MONGO_CONNECTION_URL : process.env.MONGO_CONNECTION_URL || '',
    JWT_SECRET : process.env.JWT_SECRET || '',
    env : process.env.NODE_ENV || '',
    REDIS_URL : process.env.REDIS_URL || '',
}

export default config; 