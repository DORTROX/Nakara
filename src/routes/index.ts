import { Router } from "express";
import GenerationRouter from "@/routes/generation";
import TestRouter from "@/routes/test";
import userRouter from "./user";
import { authenticateUtilityAccess } from "@/middlewares/middleware";
import MarketRouter from '@/routes/market';
import CronRouter from "./cron-jobs";

const MainRouter = Router();

MainRouter.use("/gen", authenticateUtilityAccess, GenerationRouter);
MainRouter.use("/test", TestRouter);
MainRouter.use("/u", userRouter);
MainRouter.use("/market", MarketRouter);
MainRouter.use("/cron", authenticateUtilityAccess, CronRouter);

export default MainRouter;