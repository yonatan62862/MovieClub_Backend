import express from "express";
import asyncHandler from "express-async-handler";
import { addLike, removeLike, getLikesCount } from "../controllers/likes_controller";
import { authMiddleware } from "../controllers/auth_controller"; 

const router = express.Router();

router.post("/:targetType/:targetId", authMiddleware, asyncHandler(addLike));
router.delete("/:targetType/:targetId", authMiddleware, asyncHandler(removeLike));
router.get("/:targetType/:targetId", asyncHandler(getLikesCount));

export default router;

