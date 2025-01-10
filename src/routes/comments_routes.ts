import express from "express";
const router = express.Router();
import commentsController from "../controllers/comments_controller";

router.post("/", commentsController.create.bind(commentsController));

router.get("/", commentsController.getAll.bind(commentsController));

router.get("/:id", (req, res) => { commentsController.getById(req, res);});

router.put("/:id", (req, res)  => { commentsController.updateItem(req, res); });

router.delete("/:id", commentsController.deleteItem.bind(commentsController));

export default router;
