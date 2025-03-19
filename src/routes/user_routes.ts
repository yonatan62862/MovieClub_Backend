import express, { RequestHandler } from "express";
import { usersController } from "../controllers/users_controller";

const userRoutes = express.Router();
userRoutes.get("/:userId", usersController.getUserDetails as RequestHandler);

export default userRoutes;
