import express  from "express";
import {config} from 'dotenv';
import cors from 'cors';
import cookieParser from "cookie-parser";
import { dbConnection } from "./database/dbConnect.js";
import userRouter from './router/userRouter.js';
import jobRouter from "./router/jobRouter.js";
import {errorMiddleware} from './middleware/errorMiddleware.js';

const app = express();
config({path : './config/config.env'});

app.use(
    cors({
        origin : [process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
        methods : ["GET","POST","PUT", "DELTE"],
        credentials : true,
    })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended : true}));


app.use('/user', userRouter);
app.use('/job', jobRouter);

dbConnection();

app.use(errorMiddleware);
export default app;