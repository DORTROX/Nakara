import { AddComment, createUser, GetComments } from "@/controllers/User_Controller";
import { Router } from "express";

const userRouter = Router();

userRouter.post('/create-user', createUser);
userRouter.post('/add-comment', AddComment);
userRouter.get('/comments/:chapterId', GetComments)
 
export default userRouter;