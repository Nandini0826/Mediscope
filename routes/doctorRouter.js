const express = require("express");
const router = express.Router();
const doctormodel = require("../models/doctor-model");
const isLoggedin = require("../middlewares/isLoggedind");
const { registerdoctor, logindoctor, logoutdoctor } = require("../controllers/doctorcontroller");

router.get("/test", (req, res) => {
    res.send("Doctor Router is Working!");
});

router.get("/Profiledr", isLoggedin, async (req, res) => {
    try {
        let success = req.flash("success");
        let error = req.flash("error");
        console.log("Doctor Profile route hit");

        console.log("User from middleware:", req.user); 

        if (!req.user) {  
            console.log("Doctor not found in session. Redirecting...");
            return res.redirect("/");
        }

        let doctorData = await doctormodel.findOne({ _id: req.user._id });  // FIX: Ensure _id is used
        console.log("Fetched doctor from DB:", doctorData);

        if (!doctorData) {
            console.log("Doctor not found in DB.");
            return res.status(404).send("Doctor not found");
        }

        res.render("doctor/Profiledr", { doctor: doctorData, success, error }); 
    } catch (error) {
        console.error("Error fetching doctor profile:", error);
        res.status(500).send("Server Error");
    }
});

router.post("/registerdoctor", registerdoctor);
router.post("/logindoctor", logindoctor);
router.get("/logoutdoctor", logoutdoctor);

module.exports = router;
