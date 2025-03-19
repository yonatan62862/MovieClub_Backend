import express, { RequestHandler } from "express";
import { geminiConroller } from "../controllers/gemini_controller";

const geminiRoutes = express.Router();

geminiRoutes.post("/", geminiConroller.generateAIResponse as RequestHandler);

export default geminiRoutes;
