const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const posts_routes = require("./routes/posts_routes");
const commentsRoutes = require("./routes/comments_routes");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to the database");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/posts", posts_routes);

app.use("/comments", commentsRoutes);

const initApp = () => {
  return new Promise(async (resolve, reject) => {
    await mongoose.connect(process.env.DB_CONNECT);
    resolve(app);
  });
};

module.exports = initApp;
