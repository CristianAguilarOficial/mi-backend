import dotenv from 'dotenv';
dotenv.config();
export const TOKEN_SECRET = process.env.TOKEN_SECRET;
export const MONGO_URI = process.env.MONGO_URI;
export const FRONTEND_URL = process.env.FRONTEND_URL;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
