const JWT = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authService = require("../services/authService");
const ApiError = require("../../../utils/apiError");

exports.signUp = asyncHandler(async (req, res) => {
  const { name, email, password, profileImage, phone } = req.body;

  const result = await authService.registerUser(
    { name, email, password, profileImage, phone },
    req
  );

  res.status(201).json({
    message: "✅ User registered successfully",
    data: result.user,
    token: result.token,
  });
});

exports.googleAuth = asyncHandler(async (req, res) => {
  const user = await authService.signUpWithGoogleService(req.body.idToken);
  res.status(200).json({
    message: "✅ Logged in with Google",
    data: {
      user: user.user,
      token: user.token,
    },
  });
});

exports.logIn = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.loginUser(email, password);

  if (result.verify) {
    return res.status(200).json({
      message:
        "⚠️ Your email is not verified. A verification code was sent to your email. Please verify to continue.",
    });
  }

  res.status(200).json({
    message: "✅ Logged in successfully",
    data: result.user,
    token: result.token,
  });
});

exports.verifyEmail = asyncHandler(async (req, res) => {
  const { email, OTP } = req.body;

  const result = await authService.verifyEmailOTP(email, OTP);

  res.status(200).json({
    message: "✅ Email verified successfully",
    data: result.user,
    token: result.token,
  });
});

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new ApiError("🚫 You are not logged in. Please login and try again.", 401)
    );
  }

  const decoded = JWT.verify(token, process.env.JWT_SECRET);
  const user = await authService.checkAuth(decoded);
  req.user = user;
  next();
});

exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("🚫 You are not authorized to access this route", 403)
      );
    }
    next();
  });
