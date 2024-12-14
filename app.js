const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const { default: mongoose } = require("mongoose");
const port = process.env.PORT;

mongoose.connect(process.env.DB_CONNECT);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open",function () {
  console.log("Connected to the database");
});

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

const posts_routes = require("./routes/posts_routes");
app.use("/posts", posts_routes);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});