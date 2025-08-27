const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync.js");
const { saveRedirectUrl } = require("../middleware.js");
const usercontroller = require("../controllers/users.js");

// =================== SIGNUP ===================
router.route("/signup")
  .get(usercontroller.rendersignupForm)
  .post(wrapAsync(usercontroller.signup));

// =================== LOGIN ===================
router.route("/login")
  .get(usercontroller.renderloginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    usercontroller.login
  );

// =================== LOGOUT ===================
router.get("/logout", usercontroller.logout);

// =================== OTP VERIFICATION ===================
router.get("/verify-otp", usercontroller.renderOTPForm);
router.post("/verify-otp", wrapAsync(usercontroller.verifyOTP));

module.exports = router;
