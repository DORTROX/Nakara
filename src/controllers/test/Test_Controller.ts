
import { Response, Request } from "express";

export const TestToken = async (req: Request, res: Response): Promise<void> => {
    console.log("Hello")
    console.log(req.user)
    res.sendStatus(200).json()
    return;
}
