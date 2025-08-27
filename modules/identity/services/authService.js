const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const sharp = require("sharp");
const { OAuth2Client } = require("google-auth-library");
const { v4: uuidv4 } = require("uuid");

const logger = new (require("../../../utils/loggerService"))("auth");
const uploadImage = require("../../../middlewares/uploadImageMiddleware");
const uploadToS3 = require("../../../utils/s3Uploader");
const userModel = require("../models/userModel");
const createToken = require("../../../utils/createToken");
const sendEmails = require("../../../utils/sendEmail");
const sanitize = require("../../../utils/sanitizeData");
const ApiError = require("../../../utils/apiError");

exports.uploadUserImageService = uploadImage.uploadSingleImage("profileImage");

exports.resizeImageService = asyncHandler(async (req, res, next) => {
  if (req.file) {
    const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;

    // sharp resize
    const buffer = await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({ quality: 95 })
      .toBuffer();

    const imageUrl = await uploadToS3(buffer, filename, "users");

    req.body.profileImage = imageUrl;
  }
  next();
});

exports.registerUser = asyncHandler(async (userData, req) => {
  const existingUser = await userModel.findOne({ email: userData.email });
  if (existingUser) {
    await logger.error("Registration failed - email already exists", {
      email: userData.email,
    });
    throw new ApiError("🛑 Email already in use", 400);
  }

  const user = await userModel.create(userData);
  const token = createToken(user._id);

  await logger.info("User registered successfully", { email: user.email });

  return { user: sanitize.sanitizeUser(user), token };
});

exports.signUpWithGoogleService = asyncHandler(async (idToken) => {
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, name, sub: googleId } = payload;

  if (!email || !googleId) {
    throw new ApiError("🛑 Invalid Google token", 400);
  }

  let user = await userModel.findOne({ email });

  if (user && !user.googleId) {
    throw new ApiError(
      "🛑 Email already used with password. Please login manually.",
      400
    );
  }

  if (!user) {
    user = await userModel.create({
      name,
      email,
      googleId,
      active: true,
    });
    await logger.info("New user created with Google", { email });
  } else {
    await logger.info("Google login for existing user", { email });
  }

  const token = createToken(user._id);
  return { user: sanitize.sanitizeUser(user), token };
});

exports.loginUser = asyncHandler(async (email, password) => {
  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    await logger.error("Login failed - user not found", { email });
    throw new ApiError("🛑 Invalid email or password", 401);
  }

  if (user.active === false) {
    await logger.error("Login failed - account deactivated", { email });
    throw new ApiError(
      "🛑 Your account has been deactivated. Please contact support.",
      403
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    await logger.error("Login failed - incorrect password", { email });
    throw new ApiError("🛑 Invalid email or password", 401);
  }

  if (!user.isEmailVerified && user.role !== "manager") {
    const OTP = crypto.randomInt(100000, 999999);
    user.verifyEmailCode = OTP;
    user.verifyEmailExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    await sendEmails({
      email: user.email,
      subject: "Your verify Code",
      message: `Your verification code is ${OTP}. It will expire in 5 minutes.`,
    });

    await logger.info("Verification email sent", { email });

    return { verify: true };
  }

  const token = createToken(user._id);
  await logger.info("User logged in successfully", { email });

  return { user: sanitize.sanitizeUser(user), token };
});

exports.verifyEmailOTP = asyncHandler(async (email, OTP) => {
  const user = await userModel
    .findOne({ email })
    .select("+verifyEmailCode +verifyEmailExpires");

  if (!user) {
    await logger.error("Email verification failed - user not found", { email });
    throw new ApiError("🛑 User not found.", 404);
  }

  if (user.verifyEmailExpires < Date.now()) {
    await logger.error("Email verification failed - OTP expired", { email });
    throw new ApiError("🛑 Verification code has expired.", 400);
  }

  if (user.verifyEmailCode !== parseInt(OTP)) {
    await logger.error("Email verification failed - OTP incorrect", { email });
    throw new ApiError("🛑 Invalid verification code.", 401);
  }

  user.isEmailVerified = true;
  user.verifyEmailCode = undefined;
  user.verifyEmailExpires = undefined;
  await user.save();

  const token = createToken(user._id);
  await logger.info("Email verified successfully", { email });

  return { user: sanitize.sanitizeUser(user), token };
});

exports.checkAuth = asyncHandler(async (decodedToken) => {
  const user = await userModel.findById(decodedToken.userId);
  if (!user) {
    await logger.error("Token verification failed - user not found", {
      userId: decodedToken.userId,
    });
    throw new ApiError("🛑 User not found", 401);
  }

  if (user.changedPasswordAt) {
    const changedTime = parseInt(user.changedPasswordAt.getTime() / 1000, 10);
    if (changedTime > decodedToken.iat) {
      await logger.error(
        "Token invalid - password changed after token issued",
        {
          userId: user._id,
        }
      );
      throw new ApiError(
        "🛑 Password changed recently. Please login again.",
        401
      );
    }
  }

  await logger.info("Token verified successfully", { userId: user._id });

  return user;
});
