import { NextFunction, Request, Response } from 'express';
import userModel, { IUser } from '../models/users_model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Document } from 'mongoose';


async function register(req: Request, res: Response) {
    
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        res.status(400).send({ error: 'missing required fields' });
        return;
    }
    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            res.status(400).send({ error: 'Email already in use' }); 
             return;
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await userModel.create({
            email: email,
            password: hashedPassword,
        }); 
        res.status(200).send(user);
        return;
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(400).send(error);
        return;
    }
}


const generateTokens = (user: IUser): { accessToken: string, refreshToken: string } | null => {
    if (!process.env.TOKEN_SECRET) {
        return null;
    }
    const random = Math.random().toString();
    const accessToken = jwt.sign(
        {
            _id: user._id,
            random: random
        },
        process.env.TOKEN_SECRET,
        { expiresIn: process.env.TOKEN_EXPIRE });
    const refreshToken = jwt.sign(
        {
            _id: user._id,
            random: random
        },
        process.env.TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRE });
    if (user.refreshToken == null) {
        user.refreshToken = [];
    }
    user.refreshToken.push(refreshToken);
    return {
        accessToken: accessToken,
        refreshToken: refreshToken
    };
}

const login = async (req: Request, res: Response) => {
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
     } catch {
         res.status(400).send("wrong email or password");
     }
    };

    type UserDocument = Document<unknown, {}, IUser> & IUser & Required<{
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
                user.refreshToken = user.refreshToken.filter((token) => token !== refreshToken);
                resolve(user);
            } catch {
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
    } catch {
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
    } catch {
        res.status(400).send("Access Denied");
        return;
    }
};


export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.header("Authorization") || req.header("authorization");
    const token = authorization?.split(" ")[1];

    if (!token) {
        res.status(401).send("Access Denied"); 
        return;
    }

    if (!process.env.TOKEN_SECRET) {
        res.status(500).send("Server Error: TOKEN_SECRET is not defined");
        return;
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
        if (err) {
            res.status(403).send({ error: "Access Denied" }); 
            return;
        }
        const userId = (payload as { _id: string })._id;
        req.params.userId = userId;
        next();
    });
};



export default {
    register,
    login,
    logout,
    refresh
}