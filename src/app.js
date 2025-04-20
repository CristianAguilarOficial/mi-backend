//exportar express
import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import taksRoutes from "./routes/task.routes.js";
import cors from "cors";

const app = express();
const FRONTEND_URL = process.env.URLFRONT || "http://localhost:5173";
console.log("Frontend URL:", FRONTEND_URL);
app.use(
  cors({
    origin: FRONTEND_URL, //frontend
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use("/api", authRoutes);
app.use("/api", taksRoutes);
export default app;
