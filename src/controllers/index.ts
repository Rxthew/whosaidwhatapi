
import { Request, Response, NextFunction } from "express";
import Post from "../models/post";

const getWithAnonymisedComments = async function(){
    try{
        const posts = await Post.find({published_status: true},
            {
            projection: {
                _id: 0
                }
            })
            .populate({
                path: 'comments',
                select: {
                    content: 1,
                     date: 1, 
                     _id: 0, 
                     post: 0, 
                     user: 0
                    }
            })
            .exec();
        return posts
    }
    catch(err){
        return err ? err : undefined 
    }
      
       
};

const getWithPopulatedComments = async function(){
    try{
        const posts = await Post.find({published_status: true},
            {
            projection: {
                _id: 0
                }
            })
            .populate({
                path: 'comments',
                select: {
                    content: 1, 
                    date: 1, 
                    user: 1, 
                    _id: 0, 
                    post: 0
                },
                populate: {
                    path: 'user',
                    select: {
                    username: 1,
                    first_name: 0,
                    last_name: 0,
                    password: 0,
                    member_status: 0
                    }
                }
            })
            .exec()
        return posts
    }
    catch(err){
        return err ? err : undefined
    }
};


const getAllPosts = async function(req:Request, res:Response, next:NextFunction){
    if(Object.prototype.hasOwnProperty.call(req,'isAuthenticated')){
        try{
            const comments = req.isAuthenticated() ? await getWithPopulatedComments() : await getWithAnonymisedComments()
            comments ? Object.assign(req, {comments: comments}) : false
            next()
        }
        catch(err){
            res.json({err: err})
        }
        
    }
};
