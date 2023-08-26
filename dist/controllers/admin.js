"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const post_1 = require("../models/post");
const services_1 = require("./helpers/services");
const getDetailedPosts = async function (req, res, next) {
  try {
    const posts = await post_1.Post.find({})
      .populate({
        path: "user",
        select: "username _id",
      })
      .populate({
        path: "comments",
        select: "content date user _id -post",
        populate: {
          path: "user",
          select: "username _id first_name last_name member_status",
        },
      })
      .exec();
    posts ? Object.assign(req.body, { posts: posts }) : false;
    next();
  } catch (err) {
    return res
      .status(400)
      .json({ errors: { err: err, msg: "Query return an error" } });
  }
};
const checkUserIsAdmin = async function (req, res, next) {
  const memberStatus = req.user?.member_status;
  memberStatus === "admin"
    ? next()
    : res
        .status(400)
        .json({ errors: { msg: "User member status needs to be admin." } });
};
const adminController = [
  services_1.checkUserIsAuthenticated,
  checkUserIsAdmin,
  getDetailedPosts,
  services_1.getUser,
  services_1.returnIndexData,
];
exports.default = adminController;
