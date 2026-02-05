import express from "express";
export const app = express();

import dotnet from "dotenv";
dotnet.config();

import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Import routes
import { userRoutes } from "./routes/user.routes.js";

app.use("/api/v1/users", userRoutes);

// Error handlers
import { notFound, errorHandler } from "./middlewares/errorHandler.js";
app.use(notFound);
app.use(errorHandler);
