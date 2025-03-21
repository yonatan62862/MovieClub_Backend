import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { Document } from "mongoose";
import userModel, { IUser } from "../models/users_model";

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, 10);
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    if (!req.body.profilePicture) req.body.profilePicture = null;
    const user = await userModel.create({
      firstName,
      lastName,
      email: req.body.email,
      password: hashedPassword,
      profilePicture: req.body.profilePicture,
    });

    const token = generateTokens(user);

    res.status(201).send({ user: user, token: token?.accessToken });
  } catch (err) {
    res.status(400).send("wrong email or password");
    next(err);
  }
};

const generateTokens = (
  user: IUser
): { accessToken: string; refreshToken: string } | null => {
  const secretKey = process.env.TOKEN_SECRET as string;
  if (!secretKey) {
    throw new Error("TOKEN_SECRET is not defined");
  }

  const accessTokenExpiry = process.env.TOKEN_EXPIRE?.toString() || "1d";
  const refreshTokenExpiry =
    process.env.REFRESH_TOKEN_EXPIRE?.toString() || "7d";

  const random = Math.random().toString();

  const accessToken = jwt.sign({ _id: user._id, random }, secretKey, {
    expiresIn: accessTokenExpiry,
  } as SignOptions);

  const refreshToken = jwt.sign({ _id: user._id, random }, secretKey, {
    expiresIn: refreshTokenExpiry,
  } as SignOptions);

  if (!user.refreshToken) {
    user.refreshToken = [];
  }
  user.refreshToken.push(refreshToken);

  return { accessToken, refreshToken };
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });

    if (!user || !user.password) {
      return res.status(400).send("Wrong email or password");
    }

    const valid = await bcrypt.compare(req.body.password, user.password);

    if (!valid) {
      return res.status(400).send("Wrong email or password");
    }

    const tokens = generateTokens(user);
    if (!tokens) {
      return res.status(400).send("Access Denied");
    }

    await user.save();

    res.status(200).send({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      _id: user._id,
      user,
    });
  } catch (err) {
    next(err);
  }
};


type UserDocument = Document<unknown, object, IUser> &
  IUser &
  Required<{
    _id: string;
  }> & {
    __v: number;
  };

const verifyAccessToken = (refreshToken: string | undefined) => {
  return new Promise<UserDocument>((resolve, reject) => {
    if (!refreshToken) {
      reject("Access Denied");
      return;
    }
    if (!process.env.TOKEN_SECRET) {
      reject("Server Error");
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jwt.verify(
      refreshToken,
      process.env.TOKEN_SECRET,
      async (err: any, payload: any) => {
        if (err) {
          reject("Access Denied");
          return;
        }
        const userId = payload._id;
        try {
          const user = await userModel.findById(userId);
          if (!user) {
            reject("Access Denied");
            return;
          }
          if (!user.refreshToken || !user.refreshToken.includes(refreshToken)) {
            user.refreshToken = [];
            await user.save();
            reject("Access Denied");
            return;
          }
          user.refreshToken = user.refreshToken.filter(
            (token: string) => token !== refreshToken
          );
          resolve(user);
        } catch (err) {
          console.log(err);
          reject("Access Denied");
          return;
        }
      }
    );
  });
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await verifyAccessToken(req.body.refreshToken);

    await user.save();

    res.status(200).send("Logged out");
  } catch (err) {
    res.status(400).send("Access Denied");
    next(err);
  }
};

const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await verifyAccessToken(req.body.refreshToken);

    //generate new tokens
    const tokens = generateTokens(user);
    await user.save();

    if (!tokens) {
      res.status(400).send("Access Denied");
      return;
    }
    //send response
    res.status(200).send({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (err) {
    res.status(400).send("Access Denied");
    next(err);
  }
};

/**
 * Get user profile by ID
 */
const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Update user profile picture
 */
const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { profilePicture } = req.body;

    const user = await userModel.findByIdAndUpdate(
      id,
      { profilePicture },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  register,
  login,
  logout,
  refresh,
  getProfile,
  updateProfile,
};
