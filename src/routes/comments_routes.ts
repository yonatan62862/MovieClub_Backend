import express from "express";
const router = express.Router();
import commentsController from "../controllers/comments_controller";
import { authMiddleware } from "../controllers/auth_controller";

router.post("/", authMiddleware, commentsController.create.bind(commentsController));

router.get("/", commentsController.getAll.bind(commentsController));

router.get("/:id", (req, res) => { commentsController.getById(req, res);});

router.put("/:id", (req, res)  => { commentsController.updateItem(req, res); });

router.delete("/:id", authMiddleware, commentsController.deleteItem.bind(commentsController));

export default router;
