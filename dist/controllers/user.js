"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.putUserController = exports.deleteUserController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_validator_1 = require("express-validator");
const mongoose_1 = __importDefault(require("mongoose"));
const comment_1 = require("../models/comment");
const post_1 = require("../models/post");
const user_1 = require("../models/user");
const services_1 = require("./helpers/services");
const _cascadeDeletePosts = async function (userId, session) {
  const _retrieveUserPosts = async function () {
    const posts = await post_1.Post.find(
      { user: userId },
      {},
      { session }
    ).catch((err) => {
      throw err;
    });
    return posts;
  };
  const _convertUserPostsToIds = function (posts) {
    const postsIds = posts.map((post) => post._id);
    return postsIds;
  };
  const _deleteAllCommentsFromAllPosts = async function (postsIds) {
    return postsIds.map(
      async (postId) =>
        await comment_1.Comment.deleteMany({ post: postId }, { session }).catch(
          (err) => {
            throw err;
          }
        )
    );
  };
  const _deleteAllUserPosts = async function () {
    await post_1.Post.deleteMany({ user: userId }, { session }).catch((err) => {
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
const _cascadeDeleteUserComments = async function (userId, session) {
  await comment_1.Comment.deleteMany({ user: userId }, { session }).catch(
    (err) => {
      throw err;
    }
  );
};
const _getCurrentPassword = async function (id) {
  const user = await user_1.User.findById(id).catch((err) => {
    throw err;
  });
  return user?.password;
};
const _confirmPasswordInputs = function (req) {
  const newPassword = req.body.new_password;
  const currentPassword = req.body.current_password;
  const confirm = newPassword && currentPassword;
  return confirm;
};
const checkCurrentPassword = async function (req, res, next) {
  const comparePasswords = async function () {
    const id = req.params["id"];
    const nominalCurrentPassword = await (0, services_1.hashPassword)(
      req.body.current_password.trim()
    );
    const realCurrentPassword = await _getCurrentPassword(id);
    const comparisonResult = realCurrentPassword
      ? await bcryptjs_1.default.compare(
          nominalCurrentPassword,
          realCurrentPassword
        )
      : false;
    return comparisonResult
      ? next()
      : res.status(400).json({
          errors: { msg: "Current password is incorrect. Please try again." },
        });
  };
  const inputsArePresent = _confirmPasswordInputs(req);
  return inputsArePresent ? await comparePasswords() : next();
};
const assignNewPassword = async function (req, res, next) {
  const inputsArePresent = _confirmPasswordInputs(req) ? true : false;
  const executeAssignment = async function () {
    const rawNewPassword = req.body.new_password.trim();
    const newPassword =
      rawNewPassword.length > 0
        ? await (0, services_1.hashPassword)(req.body.new_password)
        : false;
    newPassword ? Object.assign(req.body, { password: newPassword }) : false;
    next();
  };
  return inputsArePresent ? await executeAssignment() : next();
};
const confirmDelete = function (req, res, next) {
  res.json({ status: "User deleted successfully." });
};
const confirmUpdate = function (req, res, next) {
  res.json({ status: "User updated successfully." });
};
const deleteUser = async function (req, res, next) {
  try {
    const db = mongoose_1.default.connection;
    await db
      .transaction(async function finaliseDeleteUser(session) {
        const userId = req.params["id"];
        const memberStatus = req.user?.member_status;
        memberStatus === "admin"
          ? await _cascadeDeletePosts(userId, session).catch((err) => {
              throw err;
            })
          : false;
        await _cascadeDeleteUserComments(userId, session).catch((err) => {
          throw err;
        });
        await user_1.User.deleteOne(
          {
            _id: userId,
          },
          { session }
        ).catch((err) => {
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
const establishUpdateBody = function (req, res, next) {
  const _checkUpdateBodyLength = function (updateBody) {
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
  const parseProperty = function (property) {
    property in req.body
      ? Object.assign(updateBody, { [property]: req.body[property] })
      : false;
  };
  userProperties.map(parseProperty);
  _checkUpdateBodyLength(updateBody)
    ? Object.assign(req.body, { update: updateBody })
    : res.status(400).json({
        errors: {
          msg: "Update fields are either empty or invalid. Please try again",
        },
      });
  next();
};
const reassignMembership = function (req, res, next) {
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
const updateUser = async function (req, res, next) {
  try {
    const db = mongoose_1.default.connection;
    await db
      .transaction(async function finaliseUpdateUser(session) {
        await user_1.User.updateOne(
          { _id: req.params["id"] },
          {
            ...req.body.update,
          },
          { session }
        ).catch((err) => {
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
const deleteUserValidation = services_1.basicValidation;
const updateUserValidation = services_1.basicValidation;
exports.deleteUserController = [
  (0, express_validator_1.param)("id", "_id must not be empty")
    .exists()
    .trim()
    .notEmpty()
    .withMessage("_id must not be empty.")
    .escape(),
  (0, express_validator_1.param)("id").custom(services_1.checkValidityOfUserId),
  (0, express_validator_1.param)("id").custom(services_1.userExistsInDatabase),
  deleteUserValidation,
  deleteUser,
  confirmDelete,
];
exports.putUserController = [
  (0, express_validator_1.param)("id", "_id must not be empty")
    .exists()
    .trim()
    .notEmpty()
    .withMessage("_id must not be empty.")
    .escape(),
  (0, express_validator_1.param)("id").custom(services_1.checkValidityOfUserId),
  (0, express_validator_1.param)("id").custom(services_1.userExistsInDatabase),
  (0, express_validator_1.body)("first_name")
    .optional({ checkFalsy: true })
    .trim()
    .isAlpha()
    .withMessage("Characters in this field must be from the alphabet.")
    .escape(),
  (0, express_validator_1.body)("last_name")
    .optional({ checkFalsy: true })
    .trim()
    .isAlpha(undefined, { ignore: " -" })
    .withMessage(
      "Characters in this field must be from the alphabet or a hyphen."
    )
    .escape(),
  (0, express_validator_1.body)("username")
    .optional({ checkFalsy: true })
    .trim()
    .escape(),
  (0, express_validator_1.body)("username")
    .optional({ checkFalsy: true })
    .custom(services_1.noDuplicateUsernames),
  (0, express_validator_1.body)("new_password")
    .optional({ checkFalsy: true })
    .trim()
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
  updateUserValidation,
  checkCurrentPassword,
  assignNewPassword,
  reassignMembership,
  establishUpdateBody,
  updateUser,
  confirmUpdate,
];
