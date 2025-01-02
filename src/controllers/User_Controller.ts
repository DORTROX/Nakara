import { prisma } from "@/lib/prisma";
import { Response, Request } from "express";


export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
    await prisma.user.findUnique({
        where: {
            walletAddress: req.user?.wallet,
        }
    }).then(async (user) => {
        if(!user) {
            await prisma.user.create({
                data:{
                    username: req.user?.username as string,
                    walletAddress: req.user?.wallet as string
                }
            })
            res.status(200).json({message: "User has been created."})
            return;
        }
        res.status(200).json({error: "User Already Exist"})
    })
};
