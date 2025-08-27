const { check } = require("express-validator");
const slugify = require("slugify");

const validatorMiddleWare = require("../../../middlewares/validatorMiddleware");

exports.signUpValidator = [
  check("name")
    .notEmpty()
    .withMessage("name is required")
    .isLength({ min: 3 })
    .withMessage("name must be at least 3 characters")
    .isLength({ max: 32 })
    .withMessage("name must be at most 32 characters")
    .custom((value, { req }) => {
      if (req.body.name) {
        req.body.slug = slugify(value);
      }
      return true;
    }),

  check("email")
    .notEmpty()
    .withMessage("User email is required")
    .isEmail()
    .withMessage("User email must be valid"),

  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number for Egypt or Saudi Arabia"),

  check("password")
    .notEmpty()
    .withMessage("password is required")
    .isLength({ min: 9 })
    .withMessage("password must be at least 9 characters")
    .custom((password, { req }) => {
      const weakPasswords = [
        "123456",
        "123456789",
        "password",
        "12345678",
        "111111",
        "123123",
        "12345",
        "000000",
        "qwerty",
        "abc123",
        "password1",
      ];

      const isWeak = weakPasswords.includes(password);
      const invalidFormat =
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/.test(password);

      if (isWeak || invalidFormat) {
        throw new Error(
          "Password is invalid: it must be strong (uppercase, lowercase, number, special character), not commonly used."
        );
      }

      return true;
    }),

  check("passwordConfirmation")
    .notEmpty()
    .withMessage("password confirmation is required")
    .custom((confirm, { req }) => {
      if (confirm !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),

  validatorMiddleWare,
];

exports.logInValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  check("password").notEmpty().withMessage("password is required"),
  validatorMiddleWare,
];

exports.verifyEmail = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  check("OTP")
    .notEmpty()
    .withMessage("OTP is required")
    .isNumeric()
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be a 6-digit number"),
  validatorMiddleWare,
];
