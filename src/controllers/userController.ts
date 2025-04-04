import { Request, Response, NextFunction, RequestHandler } from "express";
import User from "../models/userModel";

export const getUserProfile: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user.id;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching user profile",
      error: (error as Error).message,
    });
  }
};

export const updateUserProfile: RequestHandler = async (req, res) => {
  try {
    const userId = req.params._id;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    console.log({ body: req.body, file: req.file })
    if (req.body.username) user.username = req.body.username;
    if (req.file) user.profileImage = `/uploads/${req.file.filename}`;

    await user.save();
    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({
      message: "Error updating profile",
      error: (error as Error).message,
    });
  }
};

export const searchUser = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
  try {
    const { username } = req.query;
    if (!username || typeof username !== "string") {
       res.status(400).json({ message: "Username query parameter is required" });
    }

    const users = await User.find({ username: { $regex: username, $options: "i" } });
    if (!users.length) {
       res.status(404).json({ message: "No users found" });
    }
    
    res.json(users);
  } catch (error) {
    next(error);
  }
};