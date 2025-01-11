
import { Response, Request } from "express";

export const TestToken = async (req: Request, res: Response): Promise<void> => {
    res.sendStatus(200).json()
    return;
}
