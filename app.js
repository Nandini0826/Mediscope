const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();
const db = require("./config/mongoose-connection");
const expressSession = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const userRouter = require("./routes/userRouter");
const doctorRouter = require("./routes/doctorRouter");
const readingRouter = require("./models/reading-model");
const index = require("./routes/index");

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.EXPRESS_SESSION_SECRET,
  })
);
app.use(flash());

app.use("/", index);
app.use("/users", userRouter);
app.use("/doctor", doctorRouter);

app.listen(3000);
