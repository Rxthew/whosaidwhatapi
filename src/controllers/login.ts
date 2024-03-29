import { Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import passport from "passport";
import { basicValidation } from "./helpers/services";

const authenticateUser = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  passport.authenticate("local")(req, res, next);
};

const confirmLogin = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.json({ status: "Login successful." });
};

const loginValidation = basicValidation;

const supplyUserInfo = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const filteredUserInfo = function (userRequest: Record<string, any>) {
    const user = Object.assign(userRequest, { password: "" });
    res.json(user);
  };
  req.user ? filteredUserInfo(req.user) : next();
};

const loginController = [
  body("username", "username must not be empty")
    .exists()
    .trim()
    .notEmpty()
    .withMessage("username must not be empty.")
    .escape(),
  body("password", "Password must not be empty")
    .exists()
    .trim()
    .notEmpty()
    .withMessage("Password must not be empty.")
    .isLength({ min: 8 })
    .withMessage("password needs to be a minimum of 8 characters")
    .escape(),
  loginValidation,
  authenticateUser,
  supplyUserInfo,
  confirmLogin,
];

export default loginController;
