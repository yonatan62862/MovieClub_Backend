import express from "express";
import { getRecommendations } from "../controllers/aiController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// Route to get movie recommendations (protected by auth middleware)
router.post("/", protect, getRecommendations);

export default router;