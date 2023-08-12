"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.putCommentController =
  exports.postCommentController =
  exports.deleteCommentController =
    void 0;
const express_validator_1 = require("express-validator");
const mongoose_1 = __importDefault(require("mongoose"));
const comment_1 = require("../models/comment");
const services_1 = require("./helpers/services");
const Types = mongoose_1.default.Types;
const _checkValidityOfCommentId = function (id) {
  const result = mongoose_1.default.isObjectIdOrHexString(id);
  const commentError = () => {
    throw new Error("Comment's object id is invalid.");
  };
  return result || commentError();
};
const _commentExistsInDatabase = async function (id) {
  const result = await comment_1.Comment.exists({ _id: id }).catch((err) => {
    throw err;
  });
  const commentError = () => {
    throw new Error("Comment object id is not in database");
  };
  return result || commentError();
};
const _userIsAdmin = function (status) {
  return status === "admin";
};
const checkUserIsPrivileged = function (req, res, next) {
  const memberStatus = req.user?.member_status;
  const isPrivileged =
    memberStatus === "privileged" || memberStatus === "admin";
  isPrivileged
    ? next()
    : res.status(400).json({
        errors: {
          msg: "User member status does not have the necessary privilege for this request",
        },
      });
};
const checkCommentOwnership = async function (req, res, next) {
  const parseOwnership = async function () {
    const userId = req.user?._id;
    const commentId = req.body._id;
    const comment = await comment_1.Comment.findById({ _id: commentId }).catch(
      (error) => {
        throw error;
      }
    );
    const notTheOwner = comment?.user.toString() !== userId?.toString();
    return notTheOwner
      ? res.status(400).json({
          errors: {
            msg: "User is not the owner of this comment so this operation is not allowed",
          },
        })
      : next();
  };
  const isAdmin = _userIsAdmin(req.user?.member_status);
  return isAdmin ? next() : await parseOwnership();
};
const commentValidation = services_1.basicValidation;
const confirmCommentCreated = function (req, res, next) {
  res.json({ status: "Comment created successfully." });
};
const confirmCommentDeleted = function (req, res, next) {
  res.json({ status: "Comment deleted successfully." });
};
const confirmCommentUpdated = function (req, res, next) {
  res.json({ status: "Comment updated successfully." });
};
const createComment = async function (req, res, next) {
  const db = mongoose_1.default.connection;
  try {
    await db
      .transaction(async function finaliseCommentCreate(session) {
        await comment_1.Comment.create(
          [
            {
              content: req.body.content,
              post: new Types.ObjectId(req.body.post.trim()),
              user: new Types.ObjectId(req.body.user.trim()),
              date: (0, services_1.generateDate)(),
            },
          ],
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
const deleteComment = async function (req, res, next) {
  const db = mongoose_1.default.connection;
  try {
    await db
      .transaction(async function finaliseCommentDelete(session) {
        await comment_1.Comment.deleteOne(
          {
            _id: req.body._id,
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
const updateComment = async function (req, res, next) {
  const db = mongoose_1.default.connection;
  try {
    await db
      .transaction(async function finaliseCommentUpdate(session) {
        await comment_1.Comment.updateOne(
          {
            _id: req.body._id,
          },
          {
            content: req.body.content,
            post: new Types.ObjectId(req.body.post.trim()),
            user: new Types.ObjectId(req.body.user.trim()),
            date: (0, services_1.generateDate)(),
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
exports.deleteCommentController = [
  services_1.checkUserIsAuthenticated,
  checkUserIsPrivileged,
  (0, express_validator_1.body)("_id", "Comment id must not be empty.")
    .exists()
    .trim()
    .notEmpty()
    .withMessage("Comment id must not be empty.")
    .escape(),
  (0, express_validator_1.body)("_id").custom(_checkValidityOfCommentId),
  (0, express_validator_1.body)("_id").custom(_commentExistsInDatabase),
  commentValidation,
  checkCommentOwnership,
  deleteComment,
  confirmCommentDeleted,
];
exports.postCommentController = [
  services_1.checkUserIsAuthenticated,
  checkUserIsPrivileged,
  (0, express_validator_1.body)("content", "Content must not be empty.")
    .exists()
    .trim()
    .notEmpty()
    .withMessage("Content must not be empty.")
    .escape(),
  (0, express_validator_1.body)("post", "Post id must not be empty.")
    .exists()
    .trim()
    .notEmpty()
    .withMessage("Post id must not be empty.")
    .escape(),
  (0, express_validator_1.body)("user", "User id must not be empty.")
    .exists()
    .trim()
    .notEmpty()
    .withMessage("User id must not be empty.")
    .escape(),
  (0, express_validator_1.body)("post").custom(
    services_1.checkValidityOfPostId
  ),
  (0, express_validator_1.body)("user").custom(
    services_1.checkValidityOfUserId
  ),
  (0, express_validator_1.body)("post").custom(services_1.postExistsInDatabase),
  (0, express_validator_1.body)("user").custom(services_1.userExistsInDatabase),
  commentValidation,
  createComment,
  confirmCommentCreated,
];
exports.putCommentController = [
  services_1.checkUserIsAuthenticated,
  checkUserIsPrivileged,
  (0, express_validator_1.body)("content", "Content must not be empty.")
    .exists()
    .trim()
    .notEmpty()
    .withMessage("Content must not be empty.")
    .escape(),
  (0, express_validator_1.body)("_id", "Comment id must not be empty.")
    .exists()
    .trim()
    .notEmpty()
    .withMessage("Comment id must not be empty.")
    .escape(),
  (0, express_validator_1.body)("post", "Post id must not be empty.")
    .exists()
    .trim()
    .notEmpty()
    .withMessage("Post id must not be empty.")
    .escape(),
  (0, express_validator_1.body)("user", "User id must not be empty.")
    .exists()
    .trim()
    .notEmpty()
    .withMessage("User id must not be empty.")
    .escape(),
  (0, express_validator_1.body)("_id").custom(_checkValidityOfCommentId),
  (0, express_validator_1.body)("post").custom(
    services_1.checkValidityOfPostId
  ),
  (0, express_validator_1.body)("user").custom(
    services_1.checkValidityOfUserId
  ),
  (0, express_validator_1.body)("_id").custom(_commentExistsInDatabase),
  (0, express_validator_1.body)("post").custom(services_1.postExistsInDatabase),
  (0, express_validator_1.body)("user").custom(services_1.userExistsInDatabase),
  commentValidation,
  checkCommentOwnership,
  updateComment,
  confirmCommentUpdated,
];
