
import { Request, Response, NextFunction } from "express";
import Post from "../models/post";
import { User } from "../models/user";
import { checkUserIsAuthenticated, getUser, returnIndexData } from "./helpers/services";


const getDetailedPosts = async function(req:Request, res:Response, next:NextFunction){
    try{
        const posts = await Post.find({})
            .populate({
                path: 'comments',
                select: {
                    content: 1, 
                    date: 1, 
                    user: 1, 
                    _id: 1, 
                    post: 0
                },
                populate: {
                    path: 'user',
                    select: {
                    username: 1,
                    _id: 1,
                    first_name: 1,
                    last_name: 1,
                    password: 0,
                    member_status: 1
                    }
                }
            })
            .exec()
            posts ? Object.assign(req.body, {posts: posts}) : false
            next()
    }
    catch(err){
        return err ? err : undefined
    }
}

const checkUserIsAdmin = async function(req:Request, res:Response, next:NextFunction){
    const user = req.user;
    const memberStatus = req.user?.member_status;
    if(memberStatus === 'admin'){
       next()
    }
    else{
       res.status(400).json({'errors': {msg: 'User member status needs to be admin.'}})
    }


};

export const adminController = [
    checkUserIsAuthenticated,
    checkUserIsAdmin,
    getDetailedPosts,
    getUser,
    returnIndexData
]

