"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const mongoose_1 = __importDefault(require("mongoose"));
const services_1 = require("./helpers/services");
const services_2 = require("./helpers/services");
const user_1 = require("../models/user");
const assignMembership = function (req, res, next) {
  const adminMember = function () {
    const isAdminValid = req.body.admin_code && req.body.admin_code === "4321";
    return isAdminValid
      ? Object.assign(req.body, { member_status: "admin" })
      : null;
  };
  const privilegedMember = function () {
    const isPrivilegeValid =
      req.body.privilege_code && req.body.privilege_code === "1234";
    return isPrivilegeValid
      ? Object.assign(req.body, { member_status: "privileged" })
      : null;
  };
  const regularMember = function () {
    return Object.assign(req.body, { member_status: "regular" });
  };
  adminMember() ?? privilegedMember() ?? regularMember();
  next();
};
const signUpValidation = services_1.basicValidation;
const saveUser = async function (req, res, next) {
  try {
    const db = mongoose_1.default.connection;
    const hashed = await (0, services_2.hashPassword)(req.body.password);
    const user = new user_1.User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      username: req.body.username,
      password: hashed,
      member_status: req.body.member_status,
    });
    await db
      .transaction(async function finaliseSaveUser(session) {
        await user.save({ session }).catch((err) => {
          throw err;
        });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    console.log(err);
    res.json({ err: err });
  }
  next();
};
const confirmSignup = function (req, res, next) {
  res.json({ status: "Sign-up successful." });
};
const signUpController = [
  (0, express_validator_1.body)("first_name", "First name must not be empty.")
    .exists()
    .trim()
    .notEmpty()
    .withMessage("First name must not be empty.")
    .isAlpha()
    .withMessage("Characters in this field must be from the alphabet.")
    .escape(),
  (0, express_validator_1.body)("last_name", "Last name must not be empty")
    .exists()
    .trim()
    .notEmpty()
    .withMessage("Last name must not be empty.")
    .isAlpha(undefined, { ignore: " -" })
    .withMessage(
      "Characters in this field must be from the alphabet or a hyphen."
    )
    .escape(),
  (0, express_validator_1.body)("username", "username must not be empty")
    .exists()
    .trim()
    .notEmpty()
    .withMessage("username must not be empty.")
    .escape(),
  (0, express_validator_1.body)("username").custom(
    services_1.noDuplicateUsernames
  ),
  (0, express_validator_1.body)("password", "Password must not be empty")
    .exists()
    .trim()
    .notEmpty()
    .withMessage("Password must not be empty.")
    .isLength({ min: 8 })
    .withMessage("password needs to be a minimum of 8 characters")
    .escape(),
  (0, express_validator_1.body)("privilege_code")
    .optional({ checkFalsy: true })
    .trim()
    .equals("1234")
    .withMessage("passcode for privileged status is incorrect")
    .escape(),
  (0, express_validator_1.body)("admin_code")
    .optional({ checkFalsy: true })
    .trim()
    .equals("4321")
    .withMessage("passcode for admin status is incorrect")
    .escape(),
  signUpValidation,
  assignMembership,
  saveUser,
  services_1.redirectToOrigin,
  confirmSignup,
];
exports.default = signUpController;
