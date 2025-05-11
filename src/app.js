//exportar express
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { FRONTEND_URL } from './config.js';

import authRoutes from './routes/auth.routes.js';
import taksRoutes from './routes/task.routes.js';

const app = express();
const Frontend_url = FRONTEND_URL; //cambiar en el deploy

app.use(
  cors({
    origin: Frontend_url, //frontend
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use('/api', authRoutes);
app.use('/api', taksRoutes);
export default app;
