import { NextFunction, Request, Response } from 'express';
import userModel, { IUser } from '../models/users_model';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from "jsonwebtoken";
import { Document } from 'mongoose';

const register = async (req: Request, res: Response) => {
    try {
        const password = req.body.password;
        const hashedPassword = await bcrypt.hash(password, 10);
        if (!req.body.avatar) req.body.avatar = null
        const user = await userModel.create({
            email: req.body.email,
            password: hashedPassword,
            avatar: req.body.avatar
        });
        res.status(201).send(user);
    } catch (err) {
        console.log(err)
        res.status(400).send("wrong email or password");
    }
};

const generateTokens = (user: IUser): { accessToken: string, refreshToken: string } | null => {
    const secretKey = process.env.TOKEN_SECRET as string;
    if (!secretKey) {
        throw new Error("TOKEN_SECRET is not defined");
    }

    const accessTokenExpiry = process.env.TOKEN_EXPIRE?.toString() || "1d";
    const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRE?.toString() || "7d";
    

    const random = Math.random().toString();

    const accessToken = jwt.sign(
        { _id: user._id, random },
        secretKey,
        { expiresIn: accessTokenExpiry } as SignOptions
    );

    const refreshToken = jwt.sign(
        { _id: user._id, random },
        secretKey,
        { expiresIn: refreshTokenExpiry } as SignOptions
    );

    if (!user.refreshToken) {
        user.refreshToken = [];
    }
    user.refreshToken.push(refreshToken);

    return { accessToken, refreshToken };
};



const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        //verify user & password
        const user = await userModel.findOne({ email: req.body.email });
        if (!user) {
            res.status(400).send("wrong email or password");
            return;
        }
        const valid = await bcrypt.compare(req.body.password, user.password);
        if (!valid) {
            res.status(400).send("wrong email or password");
            return;
        }
        //generate tokens
        const tokens = generateTokens(user);
        if (!tokens) {
            res.status(400).send("Access Denied");
            return;
        }
        await user.save();
        res.status(200).send(
            {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                _id: user._id
            });
    } catch (err) {
       next(err)
    }
};

type UserDocument = Document<unknown, object, IUser> & IUser & Required<{
    _id: string;
}> & {
    __v: number;
}


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
        jwt.verify(refreshToken, process.env.TOKEN_SECRET, async (err: any, payload: any) => {
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
                user.refreshToken = user.refreshToken.filter((token: string) => token !== refreshToken);
                resolve(user);
            } catch (err) {
               console.log(err)
                reject("Access Denied");
                return;
            }
        });
    });
};


const logout = async (req: Request, res: Response) => {
    try {
        const user = await verifyAccessToken(req.body.refreshToken);

        await user.save();

        res.status(200).send("Logged out");
    } catch (err) {
        console.log(err)
        res.status(400).send("Access Denied");
        return;
    }
};


const refresh = async (req: Request, res: Response) => {
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
            refreshToken: tokens.refreshToken
        });
    } catch (err) {
        console.log(err)
        res.status(400).send("Access Denied");
        return;
    }
};

/**
 * Get user profile by ID
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
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
  export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { profilePicture } = req.body;
  
      const user = await userModel.findByIdAndUpdate(id, { profilePicture }, { new: true });
  
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
    updateProfile
};