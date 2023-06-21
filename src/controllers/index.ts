
import { Request, Response, NextFunction } from "express";
import Post from "../models/post";
import { User } from "../models/user";
import { getUser, returnIndexData } from "./helpers/services";

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
                     _id: 1, 
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
                    _id: 1, 
                    post: 0
                },
                populate: {
                    path: 'user',
                    select: {
                    username: 1,
                    _id: 0,
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


const indexController = [
    getUser,
    getAllPosts,
    returnIndexData

];



export default indexController



