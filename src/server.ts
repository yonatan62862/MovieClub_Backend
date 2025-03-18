<<<<<<< HEAD
import express, { Express } from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import bodyParser from "body-parser";
import postsRoutes from "./routes/posts_routes";
import commentsRoutes from "./routes/comments_routes";
import authRoutes from "./routes/auth_routes";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import likesRoutes from "./routes/likes_routes";
import cors from "cors";


=======
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Express } from "express";
import mongoose from "mongoose";
import passport from "passport";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import authRoutes from "./routes/auth_routes";
import commentsRoutes from "./routes/comments_routes";
import likesRoutes from "./routes/likes_routes";
import postsRoutes from "./routes/posts_routes";
import "./services/passport";
import userRoutes from "./routes/user_routes";
const app = express();
dotenv.config();

app.use(passport.initialize());
>>>>>>> server_branch

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
<<<<<<< HEAD
=======
app.use(express.json());
>>>>>>> server_branch

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

app.use(cors());

<<<<<<< HEAD

=======
>>>>>>> server_branch
app.use("/posts", postsRoutes);
app.use("/comments", commentsRoutes);
app.use("/auth", authRoutes);
app.use("/likes", likesRoutes);
<<<<<<< HEAD


=======
app.use("/users", userRoutes);
>>>>>>> server_branch

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Web Dev 2025 - D - REST API",
      version: "1.0.0",
      description: "REST server including authentication using JWT",
    },
<<<<<<< HEAD
    servers: [{ url: "http://localhost:" + process.env.PORT, },],
=======
    servers: [{ url: "http://localhost:" + process.env.PORT }],
>>>>>>> server_branch
  },
  apis: ["./src/routes/*.ts"],
};
const specs = swaggerJsDoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

<<<<<<< HEAD

=======
>>>>>>> server_branch
const initApp = () => {
  return new Promise<Express>((resolve, reject) => {
    if (process.env.DB_CONNECTION == undefined) {
      reject("DB_CONNECTION is not defined");
    } else {
      mongoose
<<<<<<< HEAD
      .connect(process.env.DB_CONNECTION)
      .then(() => resolve(app))
      .catch((error) => reject(error));
=======
        .connect(process.env.DB_CONNECTION)
        .then(() => resolve(app))
        .catch((error) => reject(error));
>>>>>>> server_branch
    }
  });
};
export default initApp;
