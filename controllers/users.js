const User = require("../models/user");
const { sendOTP } = require("../utils/mailer");

// Utility: Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// =================== SIGNUP FORM ===================
module.exports.rendersignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

// =================== SIGNUP WITH OTP ===================
module.exports.signup = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;

    // Create user but mark as unverified
    const newUser = new User({ email, username, isVerified: false });

    // Generate OTP
    const otp = generateOTP();
    newUser.otp = otp;
    newUser.otpExpires = Date.now() + 5 * 60 * 1000; // expires in 5 min

    // Save user with password
    await User.register(newUser, password);

    // Send OTP via email
    await sendOTP(email, otp);

    req.flash("success", "We sent you an OTP. Please verify your email.");
    res.redirect(`/verify-otp?email=${email}`);

  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

// =================== LOGIN FORM ===================
module.exports.renderloginForm = (req, res) => {
  res.render("users/login.ejs");
};

// =================== LOGIN (Block if not verified) ===================
module.exports.login = async (req, res) => {
  if (!req.user.isVerified) {
    req.logout(() => {});
    req.flash("error", "Please verify your email before logging in.");
    return res.redirect("/login");
  }

  req.flash("success", "Welcome back to wanderLust!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

// =================== LOGOUT ===================
module.exports.logout = (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
};

// =================== OTP FORM ===================
module.exports.renderOTPForm = (req, res) => {
  const { email } = req.query;
  res.render("users/verify-otp.ejs", { email });
};

// =================== VERIFY OTP ===================
module.exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    req.flash("error", "User not found.");
    return res.redirect("/signup");
  }

  if (user.otp === otp && user.otpExpires > Date.now()) {
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    req.flash("success", "Email verified! You can now log in.");
    return res.redirect("/login");
  } else {
    req.flash("error", "Invalid or expired OTP. Please try again.");
    return res.redirect(`/verify-otp?email=${email}`);
  }
};
