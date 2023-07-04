import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { body, param } from "express-validator";
import mongoose from "mongoose";
import { Comment } from "../models/comment";
import { Post } from "../models/post";
import { User } from "../models/user";
import {
  basicValidation,
  checkValidityOfUserId,
  hashPassword,
  noDuplicateUsernames,
  redirectToOrigin,
  userExistsInDatabase,
} from "./helpers/services";

const _cascadeDeletePosts = async function (
  userId: mongoose.ObjectId | string,
  session: mongoose.mongo.ClientSession
) {
  const _retrieveUserPosts = async function () {
    const posts = await Post.find({ user: userId }, {}, { session }).catch(
      (err: Error) => {
        throw err;
      }
    );
    return posts;
  };

  const _convertUserPostsToIds = function (posts: InstanceType<typeof Post>[]) {
    const postsIds = posts.map((post) => post._id);
    return postsIds;
  };

  const _deleteAllCommentsFromAllPosts = async function (
    postsIds: mongoose.Types.ObjectId[]
  ) {
    return postsIds.map(
      async (postId) =>
        await Comment.deleteMany({ post: postId }, { session }).catch(
          (err: Error) => {
            throw err;
          }
        )
    );
  };

  const _deleteAllUserPosts = async function () {
    await Post.deleteMany({ user: userId }, { session }).catch((err: Error) => {
      throw err;
    });
  };

  const posts = await _retrieveUserPosts();
  const postsIds = _convertUserPostsToIds(posts);
  const postIdsStatus =
    postsIds && postsIds.length > 0
      ? await _deleteAllCommentsFromAllPosts(postsIds)
      : false;
  postIdsStatus ? await _deleteAllUserPosts() : false;
};

const _cascadeDeleteUserComments = async function (
  userId: mongoose.ObjectId | string,
  session: mongoose.mongo.ClientSession
) {
  await Comment.deleteMany({ user: userId }, { session }).catch(
    (err: Error) => {
      throw err;
    }
  );
};

const _getCurrentPassword = async function (
  id: mongoose.Types.ObjectId | string
) {
  const user = await User.findById(id).catch((err: Error) => {
    throw err;
  });
  return user?.password;
};

const _confirmPasswordInputs = function (req: Request) {
  const newPassword = req.body.new_password;
  const currentPassword = req.body.current_password;
  const confirm = newPassword && currentPassword;
  return confirm;
};

const checkCurrentPassword = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const comparePasswords = async function () {
    const id = req.params["id"];
    const nominalCurrentPassword = await hashPassword(
      req.body.current_password.trim()
    );
    const realCurrentPassword = await _getCurrentPassword(id);
    const comparisonResult = realCurrentPassword
      ? await bcrypt.compare(nominalCurrentPassword, realCurrentPassword)
      : false;
    return comparisonResult
      ? next()
      : res
          .status(400)
          .json({
            errors: { msg: "Current password is incorrect. Please try again." },
          });
  };

  const inputsArePresent = _confirmPasswordInputs(req);
  return inputsArePresent ? await comparePasswords() : next();
};

const assignNewPassword = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const inputsArePresent = _confirmPasswordInputs(req) ? true : false;

  const executeAssignment = async function () {
    const rawNewPassword = req.body.new_password.trim();
    const newPassword =
      rawNewPassword.length > 0
        ? await hashPassword(req.body.new_password)
        : false;
    newPassword ? Object.assign(req.body, { password: newPassword }) : false;
    next();
  };

  return inputsArePresent ? await executeAssignment() : next();
};

const confirmDelete = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.json({ status: "User deleted successfully." });
};

const confirmUpdate = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.json({ status: "User updated successfully." });
};

const deleteUser = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const db = mongoose.connection;

    await db
      .transaction(async function finaliseDeleteUser(session) {
        const userId = req.params["id"];
        const memberStatus = req.user?.member_status;

        memberStatus === "admin"
          ? await _cascadeDeletePosts(userId, session).catch((err: Error) => {
              throw err;
            })
          : false;

        await _cascadeDeleteUserComments(userId, session).catch(
          (err: Error) => {
            throw err;
          }
        );

        await User.deleteOne(
          {
            _id: userId,
          },
          { session }
        ).catch((err: Error) => {
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

const establishUpdateBody = function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const _checkUpdateBodyLength = function (updateBody: Record<string, string>) {
    const length = Object.keys(updateBody);
    return length ? true : false;
  };

  const updateBody = {};

  const userProperties = [
    "first_name",
    "last_name",
    "username",
    "password",
    "member_status",
  ];

  const parseProperty = function (property: string) {
    property in req.body
      ? Object.assign(updateBody, { [property]: req.body[property] })
      : false;
  };

  userProperties.map(parseProperty);

  _checkUpdateBodyLength(updateBody)
    ? Object.assign(req.body, { update: updateBody })
    : res
        .status(400)
        .json({
          errors: {
            msg: "Update fields are either empty or invalid. Please try again",
          },
        });
  next();
};

const reassignMembership = function (
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
    return req.body.regular
      ? Object.assign(req.body, { member_status: "regular" })
      : false;
  };

  adminMember() ?? privilegedMember() ?? regularMember();
  next();
};

const updateUser = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const db = mongoose.connection;

    await db
      .transaction(async function finaliseUpdateUser(session) {
        await User.updateOne(
          { _id: req.params["id"] },
          {
            ...req.body.update,
          },
          { session }
        ).catch((err: Error) => {
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

const deleteUserValidation = basicValidation;
const updateUserValidation = basicValidation;

export const deleteUserController = [
  param("id", "_id must not be empty")
    .exists()
    .trim()
    .notEmpty()
    .withMessage("_id must not be empty.")
    .escape(),
  param("id").custom(checkValidityOfUserId),
  param("id").custom(userExistsInDatabase),
  deleteUserValidation,
  deleteUser,
  redirectToOrigin,
  confirmDelete,
];

export const putUserController = [
  param("id", "_id must not be empty")
    .exists()
    .trim()
    .notEmpty()
    .withMessage("_id must not be empty.")
    .escape(),
  param("id").custom(checkValidityOfUserId),
  param("id").custom(userExistsInDatabase),
  body("first_name")
    .optional({ checkFalsy: true })
    .trim()
    .isAlpha()
    .withMessage("Characters in this field must be from the alphabet.")
    .escape(),
  body("last_name")
    .optional({ checkFalsy: true })
    .trim()
    .isAlpha(undefined, { ignore: " -" })
    .withMessage(
      "Characters in this field must be from the alphabet or a hyphen."
    )
    .escape(),
  body("username").optional({ checkFalsy: true }).trim().escape(),
  body("username").optional({ checkFalsy: true }).custom(noDuplicateUsernames),
  body("new_password")
    .optional({ checkFalsy: true })
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
  updateUserValidation,
  checkCurrentPassword,
  assignNewPassword,
  reassignMembership,
  establishUpdateBody,
  updateUser,
  redirectToOrigin,
  confirmUpdate,
];
