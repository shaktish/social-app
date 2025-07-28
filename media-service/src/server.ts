import express from 'express';
import config from './config/config';
import cors from "cors";
import helmet from 'helmet';
import connectDb from './config/connectDb';
import healthChecker from './routes/health';
import loggerHandler from './middleware/loggerHandler';
import globalErrorHandler from './middleware/globalErrorHandler';
import mediaRoutes from './routes/mediaRoutes';
import { connectRabbitMQ, startConsumer } from './config/connectRabbitMQ';


const app = express();
connectDb();
connectRabbitMQ();
startConsumer();
// middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(loggerHandler);



app.get('/health', healthChecker)
app.use('/api/media',mediaRoutes);

app.use(globalErrorHandler);

app.listen(config.port, () => {
    console.log(`Media service started at http://localhost:${config.port}`);
})