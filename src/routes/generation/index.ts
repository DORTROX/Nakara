import { generateMetadata } from "@/controllers/CR_Controller";
import { Router } from "express";


const GenerationRouter = Router();

GenerationRouter.post("/metadata", generateMetadata);

export default GenerationRouter;