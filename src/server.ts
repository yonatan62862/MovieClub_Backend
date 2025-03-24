import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import path from "path";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import MongoStore from "connect-mongo";
import helmet from "helmet";


dotenv.config();
import "./config/passport";

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import postRoutes from "./routes/postRoutes";
import commentRoutes from "./routes/commentRoutes";
import aiRoutes from "./routes/aiRoutes";

const app = express();

app.use(express.json());
app.use(cors());

app.use(session({
  secret: process.env.JWT_SECRET as string,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.DB_CONNECTION as string,
    ttl: 60 * 60 * 24,
  }),
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
  },
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/ai-recommend", aiRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/public", express.static("public"));
app.use("/storage", express.static("storage"));

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Web Dev 2025 - D - REST API",
      version: "1.0.0",
      description: "REST server including authentication using JWT",
    },
    servers: [
      { url: "http://localhost:" + process.env.PORT },
      { url: "http://10.10.246.17" },
      { url: "https://10.10.246.17" },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

const specs = swaggerJsDoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

app.use(helmet({ contentSecurityPolicy: false }))

const frontendPath = path.join(__dirname, "..", "front");
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

const initApp = () => {
  return new Promise<Express>(async (resolve, reject) => {
    if (!process.env.DB_CONNECTION) {
      reject("DB_CONNECTION is not defined");
    } else {
      await mongoose.connect(process.env.DB_CONNECTION);
      console.log("Connected to MongoDB successfully.");
      resolve(app);
    }
  });
};

export default initApp;
