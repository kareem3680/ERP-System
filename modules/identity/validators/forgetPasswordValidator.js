const { check } = require("express-validator");

const validatorMiddleWare = require("../../../middlewares/validatorMiddleware");

exports.sendResetCodeValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  validatorMiddleWare,
];

exports.verifyResetCodeValidator = [
  check("resetCode").notEmpty().withMessage("resetCode is required"),
  validatorMiddleWare,
];

exports.resetPasswordValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  check("newPassword")
    .notEmpty()
    .withMessage("newPassword is required")
    .isLength({ min: 9 })
    .withMessage("newPassword must be at least 9 characters")
    .custom((newPassword, { req }) => {
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

      const isWeak = weakPasswords.includes(newPassword);
      const invalidFormat =
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/.test(newPassword);

      if (isWeak || invalidFormat) {
        throw new Error(
          "newPassword is invalid: it must be strong (uppercase, lowercase, number, special character), not commonly used."
        );
      }

      return true;
    }),

  check("confirmNewPassword")
    .notEmpty()
    .withMessage("confirmNewPassword is required")
    .custom((confirm, { req }) => {
      if (confirm !== req.body.newPassword) {
        throw new Error("confirmNewPassword does not match NewPassword");
      }
      return true;
    }),
  validatorMiddleWare,
];
