"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.putPostController =
  exports.postPostController =
  exports.deletePostController =
    void 0;
const express_validator_1 = require("express-validator");
const mongoose_1 = __importDefault(require("mongoose"));
const comment_1 = require("../models/comment");
const post_1 = require("../models/post");
const services_1 = require("./helpers/services");
const _cascadeDeletePostComments = async function (postId, session) {
  await comment_1.Comment.deleteMany({ post: postId }, { session }).catch(
    (err) => {
      throw err;
    }
  );
};
const checkUserIsAdmin = function (req, res, next) {
  const memberStatus = req.user?.member_status;
  const isAdmin = memberStatus === "admin";
  return isAdmin
    ? next()
    : res.status(400).json({
        errors: {
          msg: "User member status does not have the necessary privilege for this request",
        },
      });
};
const createPost = async function (req, res, next) {
  const db = mongoose_1.default.connection;
  try {
    await db
      .transaction(async function finalisePostCreate(session) {
        await post_1.Post.create(
          [
            {
              title: req.body.title,
              content: req.body.content,
              published_status: req.body.published_status || false,
              user: new mongoose_1.default.Types.ObjectId(req.body.user.trim()),
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
const checkPostOwnership = async function (req, res, next) {
  const userId = req.user?._id;
  const postId = req.body._id;
  const post = await post_1.Post.findById({ _id: postId }).catch((error) => {
    throw error;
  });
  const notTheOwner = post?.user.toString() !== userId?.toString();
  return notTheOwner
    ? res.status(400).json({
        errors: {
          msg: "User is not the owner of this post so this operation is not allowed",
        },
      })
    : next();
};
const confirmPostCreated = function (req, res, next) {
  res.json({ status: "Post created successfully." });
};
const confirmPostDeleted = function (req, res, next) {
  res.json({ status: "Post deleted successfully." });
};
const confirmPostUpdated = function (req, res, next) {
  res.json({ status: "Post updated successfully." });
};
const deletePost = async function (req, res, next) {
  const db = mongoose_1.default.connection;
  try {
    await db
      .transaction(async function finalisePostDelete(session) {
        await _cascadeDeletePostComments(req.body._id, session).catch((err) => {
          throw err;
        });
        await post_1.Post.deleteOne(
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
const postValidation = services_1.basicValidation;
const updatePost = async function (req, res, next) {
  const db = mongoose_1.default.connection;
  try {
    await db
      .transaction(async function finalisePostUpdate(session) {
        await post_1.Post.updateOne(
          {
            _id: req.body._id,
          },
          {
            title: req.body.title,
            content: req.body.content,
            published_status: req.body.published_status || false,
            user: new mongoose_1.default.Types.ObjectId(req.body.user.trim()),
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
exports.deletePostController = [
  services_1.checkUserIsAuthenticated,
  checkUserIsAdmin,
  (0, express_validator_1.body)("_id", "Post id must not be empty.")
    .exists()
    .trim()
    .notEmpty()
    .withMessage("Post id must not be empty.")
    .escape(),
  (0, express_validator_1.body)("_id").custom(services_1.checkValidityOfPostId),
  (0, express_validator_1.body)("_id").custom(services_1.postExistsInDatabase),
  postValidation,
  checkPostOwnership,
  deletePost,
  services_1.redirectToOrigin,
  confirmPostDeleted,
];
exports.postPostController = [
  services_1.checkUserIsAuthenticated,
  checkUserIsAdmin,
  (0, express_validator_1.body)("content", "Content must not be empty.")
    .exists()
    .trim()
    .notEmpty()
    .withMessage("Content must not be empty.")
    .escape(),
  (0, express_validator_1.body)("title", "Title must not be empty.")
    .exists()
    .trim()
    .notEmpty()
    .withMessage("Title must not be empty.")
    .escape(),
  (0, express_validator_1.body)("user", "User id must not be empty.")
    .exists()
    .trim()
    .notEmpty()
    .withMessage("User id must not be empty.")
    .escape(),
  (0, express_validator_1.body)("user").custom(
    services_1.checkValidityOfUserId
  ),
  (0, express_validator_1.body)("user").custom(services_1.userExistsInDatabase),
  postValidation,
  createPost,
  services_1.redirectToOrigin,
  confirmPostCreated,
];
exports.putPostController = [
  services_1.checkUserIsAuthenticated,
  checkUserIsAdmin,
  (0, express_validator_1.body)("content", "Content must not be empty.")
    .exists()
    .trim()
    .notEmpty()
    .withMessage("Content must not be empty.")
    .escape(),
  (0, express_validator_1.body)("title", "Title must not be empty.")
    .exists()
    .trim()
    .notEmpty()
    .withMessage("Title must not be empty.")
    .escape(),
  (0, express_validator_1.body)("_id", "Post id must not be empty.")
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
  (0, express_validator_1.body)("_id").custom(services_1.checkValidityOfPostId),
  (0, express_validator_1.body)("user").custom(
    services_1.checkValidityOfUserId
  ),
  (0, express_validator_1.body)("_id").custom(services_1.postExistsInDatabase),
  (0, express_validator_1.body)("user").custom(services_1.userExistsInDatabase),
  postValidation,
  checkPostOwnership,
  updatePost,
  services_1.redirectToOrigin,
  confirmPostUpdated,
];
