import express, { RequestHandler } from "express";
import {
    toggleLike
} from "../controllers/likes_controller";

const router = express.Router();
router.put("/:targetType/:targetId/:userId", toggleLike as RequestHandler);


export default router;
