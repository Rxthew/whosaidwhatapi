"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const passport_1 = __importDefault(require("passport"));
const services_1 = require("./helpers/services");
const authenticateUser = function (req, res, next) {
  const referer = req.get("Referer");
  return referer
    ? passport_1.default.authenticate("local", {
        failureRedirect: referer,
        failureMessage: true,
      })(req, res, next)
    : passport_1.default.authenticate("local")(req, res, next);
};
const confirmLogin = function (req, res, next) {
  res.json({ status: "Login successful." });
};
const loginValidation = services_1.basicValidation;
const supplyUserInfo = function (req, res, next) {
  const filteredUserInfo = function (userRequest) {
    const user = Object.assign(userRequest, { password: "" });
    res.json(user);
  };
  req.user ? filteredUserInfo(req.user) : next();
};
const loginController = [
  (0, express_validator_1.body)("username", "username must not be empty")
    .exists()
    .trim()
    .escape(),
  (0, express_validator_1.body)("password", "Password must not be empty")
    .exists()
    .trim()
    .isLength({ min: 8 })
    .withMessage("password needs to be a minimum of 8 characters")
    .escape(),
  loginValidation,
  authenticateUser,
  services_1.redirectToReferringPage,
  services_1.redirectToOrigin,
  supplyUserInfo,
  confirmLogin,
];
exports.default = loginController;
