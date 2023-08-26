"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const post_1 = require("../models/post");
const services_1 = require("./helpers/services");
const getWithAnonymisedComments = async function () {
  try {
    const posts = await post_1.Post.find({ published_status: true })
      .populate({
        path: "user",
        select: "username _id",
      })
      .populate({
        path: "comments",
        select: "content date _id -post",
      })
      .exec();
    return posts;
  } catch (err) {
    return err ? err : undefined;
  }
};
const getWithPopulatedComments = async function () {
  try {
    const posts = await post_1.Post.find({ published_status: true })
      .populate({
        path: "user",
        select: "username _id",
      })
      .populate({
        path: "comments",
        select: "content date user _id -post",
        populate: {
          path: "user",
          select: "username",
        },
      })
      .exec();
    return posts;
  } catch (err) {
    return err ? err : undefined;
  }
};
const getAllPosts = async function (req, res, next) {
  if (Object.prototype.hasOwnProperty.call(req, "isAuthenticated")) {
    try {
      const posts = req.isAuthenticated()
        ? await getWithPopulatedComments().catch((err) => {
            throw err;
          })
        : await getWithAnonymisedComments().catch((err) => {
            throw err;
          });
      posts ? Object.assign(req.body, { posts: posts }) : false;
      next();
    } catch (err) {
      res.json({ err: err });
    }
  } else {
    res.json({ err: { msg: "Could not authenticate user." } });
  }
};
const indexController = [
  services_1.getUser,
  getAllPosts,
  services_1.returnIndexData,
];
exports.default = indexController;
