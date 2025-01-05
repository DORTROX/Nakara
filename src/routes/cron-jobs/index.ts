import { Router } from "express";

import { CreateBedEndJob } from "@/controllers/Cron_Controller";

const CronRouter = Router();

CronRouter.post("/create-betEnd/:id", CreateBedEndJob);

export default CronRouter;
