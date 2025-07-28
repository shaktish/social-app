import mongoose from 'mongoose';
import config from './config';
import logger from '../utils/logger';

const connectDb = async () => {
    try{
        await mongoose.connect(config.mongoConnectionUrl);        
        logger.info("Db connected successfully");
    }catch(e) {
        logger.warn("Db not able to connect");
    }
    
}

export default connectDb;