const express = require("express");
const router = express.Router();
const usermodel = require("../models/user-model");
const isLoggedin = require("../middlewares/isloggedin")
const {registeruser, loginuser, logout, deleteuser} = require("../controllers/usercontroller");

router.get("/", function(req, res)
{
    res.render("index");
});







module.exports = router;
