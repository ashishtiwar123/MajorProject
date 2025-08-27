const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
      // avoid duplicate emails
  },
  isVerified: {
    type: Boolean,
    default: false, // set true after OTP verification
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
});

// This adds username, hash, salt fields and helper methods
userSchema.plugin(passportLocalMongoose, {
  usernameField: "email", // make email act as the username
});

module.exports = mongoose.model("User", userSchema);
