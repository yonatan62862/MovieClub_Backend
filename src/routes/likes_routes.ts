import express from "express";
import asyncHandler from "express-async-handler";
import { addLike, removeLike, getLikesCount } from "../controllers/likes_controller";
import { authMiddleware } from "../middlewares/auth_middleware"; 

const router = express.Router();

router.post("/:targetType/:targetId/:userId", authMiddleware, asyncHandler(addLike));
router.delete("/:targetType/:targetId/:userId", authMiddleware, asyncHandler(removeLike));
router.get("/:targetType/:targetId", asyncHandler(getLikesCount));

export default router;

