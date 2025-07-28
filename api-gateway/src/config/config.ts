import dotenv from 'dotenv';

dotenv.config();

interface Config {
    port : number;
    env : string;
    redisUrl : string;
    jwtSecret : string,
    identityServiceUrl : string;
    postServiceUrl : string;
    mediaServiceUrl : string;
    searchServiceUrl : string;
    
}
const config : Config = {
    port : Number(process.env.PORT) || 5010,
    env : process.env.NODE_ENV || '',
    redisUrl : process.env.REDIS_URL || '',
    jwtSecret : process.env.JWT_SECRET || '',
    identityServiceUrl : process.env.IDENTITY_SERVICE_URL || '',
    postServiceUrl: process.env.POST_SERVICE_URL || '',
    mediaServiceUrl: process.env.MEDIA_SERVICE_URL || '',    
    searchServiceUrl: process.env.SEARCH_SERVICE_URL || '',    
}

export default config; 