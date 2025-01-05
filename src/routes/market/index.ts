import { BuyStory, GetListedStories, listStories } from "@/controllers/Market_Controller";
import { authenticateUtilityAccess } from "@/middlewares/middleware";
import { Router } from "express";



const MarketRouter = Router();

MarketRouter.get("/stories/:page", GetListedStories);
MarketRouter.post("/list/:id", authenticateUtilityAccess, listStories);
MarketRouter.post("/buy/:id", authenticateUtilityAccess, BuyStory);

export default MarketRouter;