import { Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import {
  basicValidation,
  noDuplicateUsernames,
  redirectToOrigin,
} from "./helpers/services";
import { hashPassword } from "./helpers/services";
import { User } from "../models/user";

const assignMembership = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
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

const signUpValidation = basicValidation;

const saveUser = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const db = mongoose.connection;
    const hashed = await hashPassword(req.body.password);
    const user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      username: req.body.username,
      password: hashed,
      member_status: req.body.member_status,
    });

    await db
      .transaction(async function finaliseSaveUser(session) {
        await user.save({ session }).catch((err: Error) => {
          throw err;
        });
      })
      .catch((err: Error) => {
        throw err;
      });
  } catch (err) {
    console.log(err);
    res.json({ err: err });
  }
  next();
};

const confirmSignup = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.json({ status: "Sign-up successful." });
};

const signUpController = [
  body("first_name", "First name must not be empty.")
    .exists()
    .trim()
    .isAlpha()
    .withMessage("Characters in this field must be from the alphabet.")
    .escape(),
  body("last_name", "Last name must not be empty")
    .exists()
    .trim()
    .isAlpha(undefined, { ignore: " -" })
    .withMessage(
      "Characters in this field must be from the alphabet or a hyphen."
    )
    .escape(),
  body("username", "username must not be empty").exists().trim().escape(),
  body("username").custom(noDuplicateUsernames),
  body("password", "Password must not be empty")
    .exists()
    .trim()
    .isLength({ min: 8 })
    .withMessage("password needs to be a minimum of 8 characters")
    .escape(),
  body("privilege_code")
    .optional({ checkFalsy: true })
    .trim()
    .equals("1234")
    .withMessage("passcode for privileged status is incorrect")
    .escape(),
  body("admin_code")
    .optional({ checkFalsy: true })
    .trim()
    .equals("4321")
    .withMessage("passcode for admin status is incorrect")
    .escape(),
  signUpValidation,
  assignMembership,
  saveUser,
  redirectToOrigin,
  confirmSignup,
];

export default signUpController;
