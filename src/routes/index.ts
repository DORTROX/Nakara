import { Router } from "express";
import GenerationRouter from "@/routes/generation";


const MainRouter = Router();

MainRouter.use("/gen", GenerationRouter);

export default MainRouter;