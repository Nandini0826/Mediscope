const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
fullname:{
    type: String,
    minlength: 3,
    trim: true,
},
email: String,
password: String,
medications:  {
    type: Array,
    default: [],
  },
  
medicalHistory:  {
    type: Array,
    default: [],
  },
treatment: String,

readings: [{
   type: mongoose.Schema.Types.ObjectId,
   ref: 'reading'
  }
]    

});
module.exports = mongoose.model("user", userSchema);
