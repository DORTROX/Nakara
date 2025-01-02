import { createUser } from "@/controllers/User_Controller";
import { Router } from "express";

const userRouter = Router();

userRouter.post('/create-user', createUser);
 
export default userRouter;