const jwt = require("jsonwebtoken");
const doctorModel = require("../models/doctor-model");

module.exports = async function(req, res, next)
{
    if(!req.cookies.token)
    {
        req.flash("error","You need to login first");
        return res.redirect("/index");
    }

    try{
        let decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
        let user = await doctorModel
        .findOne({email: decoded.email})
        .select("-password");

        if (!user) {
            req.flash("error", "User not found.");
            return res.redirect("/index");
        }

        req.user = user;
        next();
    }
    catch(err) {
        req.flash("error", "something went wrong.");
        res.redirect("/index"); 
    }
}