import "dotenv/config";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { createStream } from "rotating-file-stream";
import MainRouter from "@/routes";

const app: Application = express();
const accessLogStream = createStream("access.log", {
  interval: "1d", // Rotate daily
  path: path.join(__dirname, "log"),
  compress: "gzip", // Compress rotated files
});
const corsOption = {
  origin: "",
}; // To be used in production, once our domain is up and ready.

app.use(cors());
app.use(express.json());
app.use(morgan("combined", { stream: accessLogStream }));

app.use("/api", MainRouter);

export default app;
