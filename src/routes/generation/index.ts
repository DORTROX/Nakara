import { Router } from "express";
import { generateChapter, generateMetadata } from "@/controllers/CR_Controller";


const GenerationRouter = Router();

GenerationRouter.post("/metadata", generateMetadata);
GenerationRouter.post("/chapter/:id", generateChapter);

export default GenerationRouter;