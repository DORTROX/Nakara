import { BuyStory, GetListedStories, GetStories, GetStory, GetStoryChapter, listStories, PlaceBet } from "@/controllers/Market_Controller";
import { authenticateUtilityAccess } from "@/middlewares/middleware";
import { Router } from "express";



const MarketRouter = Router();

MarketRouter.get("/listed-stories/:page", GetListedStories);
MarketRouter.get("/stories/:page", GetStories);
MarketRouter.post("/list/:id", authenticateUtilityAccess, listStories);
MarketRouter.post("/buy/:id", authenticateUtilityAccess, BuyStory);
MarketRouter.get('/story/:id', GetStory);
MarketRouter.get('/chapter/:id', GetStoryChapter);
MarketRouter.post("/place-bet", PlaceBet);



export default MarketRouter;