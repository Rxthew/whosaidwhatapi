
import { Request, Response, NextFunction } from "express";
import Post from "../models/post";
import { User } from "../models/user";

type UserType = InstanceType<typeof User>;
declare global {
    namespace Express {
        interface User extends UserType {}
    }
}

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
            const posts = req.isAuthenticated() ? await getWithPopulatedComments() : await getWithAnonymisedComments()
            posts ? Object.assign(req.body, {posts: posts}) : false
            next()
        }
        catch(err){
            res.json({err: err})
        }
        
    }
    else{
        res.json({err: {msg: 'Could not authenticate user.'}})
    }
        
    
};

const getUser = async function(req:Request, res:Response, next:NextFunction){
    if(Object.prototype.hasOwnProperty.call(req,'isAuthenticated')){
        const user = req.isAuthenticated() ? req.user : false;
        if(user){
            Object.assign(req.body,{user: {username: user.username, member_status: user.member_status}})
        }
        next()
    }
    else{
        res.json({err: {msg: 'Could not authenticate user.'}})
    }
};

const returnIndexData = function(req:Request, res:Response, next:NextFunction){
    const responseBody = {posts: req.body.posts};
    req.body.user ? Object.assign(responseBody, {user: req.body.user}) : false;
    res.json(responseBody);
};

const indexController = [
    getUser,
    getAllPosts,
    returnIndexData

];



export default indexController



