import express from "express";
const router = express.Router();
import postsController from "../controllers/posts_controller";

router.get("/by-owner",(req, res) => { postsController.getByOwner(req, res); });

router.get("/", postsController.getAll.bind(postsController));

router.get("/:id", (req, res) => { postsController.getById(req, res); });

router.post("/", postsController.create.bind(postsController));

router.put("/:id", (req, res)  => { postsController.updateItem(req, res); });

router.delete("/:id", postsController.deleteItem.bind(postsController));



export default router;
