import { AddComment, createUser, GetComments, GetProfile, GetUser } from "@/controllers/User_Controller";
import { Router } from "express";

const userRouter = Router();

userRouter.post('/create-user', createUser);
userRouter.post('/add-comment', AddComment);
userRouter.get('/comments/:chapterId', GetComments)
userRouter.get('/get-user', GetUser);
userRouter.get('/profile', GetProfile);
 
export default userRouter;