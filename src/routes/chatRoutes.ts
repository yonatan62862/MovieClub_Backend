import express, { Request, Response, NextFunction } from "express";
import { protect } from "../middleware/authMiddleware";
import { chatsService } from "../services/chatService";
import { Chat } from "../models/chatModel";

const chatsRouter = express.Router();

chatsRouter.get("/:_id", protect, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.params._id;
        if (!userId) {
            res.status(400).json({ message: "User ID is missing" });
            return;
        }

        const chats = await chatsService.getChats(userId);
        res.status(200).json(chats);
    } catch (error) {
        console.error("Error in /chat:", error);
        next(error);
    }
});

chatsRouter.post("/", protect, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { participants } = req.body;
  
      if (!Array.isArray(participants) || participants.length < 2) {
        res.status(400).json({ message: "At least two participants are required." });
        return;
      }
  
      const newChat = new Chat({ participants });
  
      const chat = await chatsService.startChat(newChat);
      res.status(201).json(chat);
    } catch (error) {
      console.error("Error in /chat:", error);
      next(error);
    }
  });
  


export default chatsRouter;  
