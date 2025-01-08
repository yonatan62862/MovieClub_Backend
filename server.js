const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const postsRoute = require("./routes/posts_routes");
const commentsRoutes = require("./routes/comments_routes");

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/posts", postsRoute);

app.use("/comments", commentsRoutes);

app.get("/about", (req, res) => {
  res.send("Hello World!");
});

const initApp = () => {
  return new Promise(async (resolve, reject) => {
    await mongoose.connect(process.env.DB_CONNECTION);
    resolve(app);
  });
};
module.exports = initApp;
