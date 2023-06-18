import bcrypt from 'bcryptjs';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import createError from 'http-errors';
import { HttpError } from 'http-errors';
import methodOverride from 'method-override';
import mongoose from 'mongoose';
import logger from 'morgan';
import passport from 'passport';
import { Strategy as LocalStrategy }  from 'passport-local';
import { User } from './models/user';
import commentRouter from './routes/comment';
import indexRouter from './routes/index';
import loginRouter from './routes/login';
import signUpRouter from './routes/signup';
import userRouter from './routes/user';

dotenv.config();

const username = process.env.username;
const password = process.env.password;
const applicableCORS = process.env.NODE_ENV === 'production' && process.env.origin ? cors() : cors({origin: process.env.origin})

const mongoDb = `mongodb+srv://${username}:${password}@cluster0.jsx1fwc.mongodb.net/?retryWrites=true&w=majority`
mongoose.connect(mongoDb);
const db = mongoose.connection;
db.on('error',console.error.bind(console,"MongoDB failed connection"));


const app = express();
const secret = process.env.secret ?? 'development_secret'
const sessionStore = MongoStore.create({
  mongoUrl: mongoDb
})

app.use(session({secret, resave: false, saveUninitialized: true, store: sessionStore}));
passport.use(new LocalStrategy(async(username, password, done)=>{
  try{
    const user = await User.findOne({
      username: username
    })

    switch(true){
      case !user: return done(null,false,{message: 'Username or password is incorrect'})
      case !await bcrypt.compare(password, (user as any).password): return done(null,false,{message: 'Username or password is incorrect'})
      default: return done(null,user as any)
    }
  }catch(err){
    return done(err)
  }
}));

passport.serializeUser((user,done)=>{
  done(null,(user as any).id);
});

passport.deserializeUser(async(id,done)=>{
  try{
    const user = await User.findById(id);
    done(null,user)
  }
  catch(error){
    return done(error)
  }
});

app.use(passport.initialize());
app.use(passport.session());
app.use(applicableCORS);
app.use(methodOverride('_method'))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/login',loginRouter);
app.use('/signup',signUpRouter);
app.use('/comment',commentRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err:HttpError, req:Request, res:Response, _next:NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
