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


const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

app.use("/posts", postsRoutes);
app.use("/comments", commentsRoutes);
app.use("/auth", authRoutes);


app.get("/about", (req, res) => {
  res.send("Hello World!");
});

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Web Dev 2025 - D - REST API",
      version: "1.0.0",
      description: "REST server including authentication using JWT",
    },
    servers: [{ url: "http://localhost:" + process.env.PORT, },],
  },
  apis: ["./src/routes/*.ts"],
};
const specs = swaggerJsDoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));


const initApp = () => {
  return new Promise<Express>((resolve, reject) => {
    if (process.env.DB_CONNECTION == undefined) {
      reject("DB_CONNECTION is not defined");
    } else {
      mongoose
      .connect(process.env.DB_CONNECTION)
      .then(() => resolve(app))
      .catch((error) => reject(error));
    }
  });
};
export default initApp;
