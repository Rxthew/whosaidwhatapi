
import { Request, Response, NextFunction } from "express";
import { Post } from "../models/post";
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
        const posts = await Post.find({published_status: true})
            .populate({
                path: 'comments',
                select: 'content date _id -post'
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
        const posts = await Post.find({published_status: true})
            .populate({
                path: 'comments',
                select:  'content date user _id -post',
                populate: {
                    path: 'user',
                    select: 'username'
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
            const posts = req.isAuthenticated() ? await getWithPopulatedComments().catch((err)=> {throw err}) : await getWithAnonymisedComments().catch((err)=> {throw err})
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



