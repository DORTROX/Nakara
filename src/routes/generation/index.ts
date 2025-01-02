import { Router } from "express";
import { generateMetadata } from "@/controllers/CR_Controller";


const GenerationRouter = Router();

GenerationRouter.post("/metadata", generateMetadata);

export default GenerationRouter;