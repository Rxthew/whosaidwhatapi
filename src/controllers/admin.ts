import { Request, Response, NextFunction } from "express";
import { Post } from "../models/post";
import {
  checkUserIsAuthenticated,
  getUser,
  returnIndexData,
} from "./helpers/services";

const getDetailedPosts = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const posts = await Post.find({})
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

const checkUserIsAdmin = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  const memberStatus = req.user?.member_status;
  memberStatus === "admin"
    ? next()
    : res
        .status(400)
        .json({ errors: { msg: "User member status needs to be admin." } });
};

const adminController = [
  checkUserIsAuthenticated,
  checkUserIsAdmin,
  getDetailedPosts,
  getUser,
  returnIndexData,
];

export default adminController;
