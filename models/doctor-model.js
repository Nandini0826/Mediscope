const mongoose = require("mongoose");

const doctorSchema = mongoose.Schema({
    fullname:{
        type: String,
        minlength: 3,
        trim: true,
    },
    email: String,
    password: String,
    patients:  {
         type: mongoose.Schema.Types.ObjectId,
           ref: 'user'
      },
    });
    module.exports = mongoose.model("doctor", doctorSchema);
    