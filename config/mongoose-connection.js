const mongoose = require("mongoose");
const debug = require("debug");
const config = require("config");
const dbgr = debug(`${process.env.NODE_ENV}:mongoose`);

mongoose
  .connect(`${config.get("MONGODB_URI")}/Mediscope`)
  .then(function () {
    
    console.log("connected");
  })
  .catch(function (err) {
    console.log(err);
  });
module.exports = mongoose.connection;
