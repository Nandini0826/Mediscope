const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/generatetoken");

//registration
module.exports.registeruser = async function (req, res) {
  let { fullname, email, password } = req.body;
  let user = await userModel.findOne({ email: email });
  if (user) {
    return res.redirect("/");
    req.flash("error", "User already exists");
  }

  bcrypt.genSalt(10, function (err, salt) {
    if (err) return res.send(err.message);
    bcrypt.hash(password, salt, async function (err, hash) {
      if (err) return res.send(err.message);
      else {
        let user = await userModel.create({
          fullname,
          email,
          password: hash,
        });
        let token = generateToken(user);
        res.cookie("token", token);
        req.flash("success", "User registered successfully");
        return res.redirect("/users/home");
      }
    });
  });
};

//userlogin
module.exports.loginuser = async function (req, res) {
  let { email, password } = req.body;
  let user = await userModel.findOne({ email: email });
  console.log("Login request received");
  if (!user) {
    req.flash("error", "Email or password incorrect");
    return res.redirect("/");
  }

  bcrypt.compare(password, user.password, function (err, result) {
    if (err) return res.send(err.message);

    if (result) {
      let token = generateToken(user);
      res.cookie("token", token);
      res.redirect("/users/Profile");
    } else {
      req.flash("error", "Email or password incorrect");
      return res.redirect("/");
    }
  });
};
module.exports.logout = async function (req, res) {
  res.cookie("token", "");
  res.redirect("/");
};
module.exports.deleteuser = async function (req, res) {
  let user = await userModel.findById(req.params.id);
  if (!user) {
    req.flash("User not found");
  } else {
    await userModel.findByIdAndDelete(user._id);
    res.cookie("token", "");
    res.redirect("/");
    req.flash("User id deleted Successfully!");
  }
};
