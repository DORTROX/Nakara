import { TestToken } from "@/controllers/test/Test_Controller";
import { Router } from "express";


const TestRouter = Router();

TestRouter.post("/token-auth", TestToken)

export default TestRouter;