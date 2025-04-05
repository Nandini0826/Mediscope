const doctorModel = require("../models/doctor-model");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/generatetoken");

//registration
module.exports.registerdoctor = async function (req, res) {
  let { fullname, email, password } = req.body;
  let doctor = await doctorModel.findOne({ email: email });
  if (doctor) {
    return res.redirect("/");
    req.flash("error", "User already exists");
  }

  bcrypt.genSalt(10, function (err, salt) {
    if (err) return res.send(err.message);
    bcrypt.hash(password, salt, async function (err, hash) {
      if (err) return res.send(err.message);
      else {
        let doctor = await doctorModel.create({
          fullname,
          email,
          password: hash,
        });
        let token = generateToken(doctor);
        res.cookie("token", token);
        req.flash("success", "Doctor registered successfully");
        return res.redirect("doctor/Profiledr");
      }
    });
  });
};

//drlogin
module.exports.logindoctor = async function (req, res) {
  let { email, password } = req.body;
  let doctor = await doctorModel.findOne({ email: email });
  console.log("Login request received");
  if (!doctor) {
    req.flash("error", "Email or password incorrect");
    return res.redirect("/");
  }

  bcrypt.compare(password, doctor.password, function (err, result) {
    if (err) return res.send(err.message);

    if (result) {
      let token = generateToken(doctor);
      res.cookie("token", token);
      res.redirect("doctor/Profiledr");
    } else {
      req.flash("error", "Email or password incorrect");
      return res.redirect("/");
    }
  });
};

module.exports.logoutdoctor = async function (req, res) {
    res.cookie("token", "");
    res.redirect("/");
  };
