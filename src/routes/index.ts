import { Router } from "express";
import GenerationRouter from "@/routes/generation";
import TestRouter from "@/routes/test";
import userRouter from "./user";
import { authenticateUtilityAccess } from "@/middlewares/middleware";

const MainRouter = Router();

MainRouter.use("/gen", authenticateUtilityAccess, GenerationRouter);
MainRouter.use("/test", TestRouter);
MainRouter.use("/u", userRouter);

export default MainRouter;