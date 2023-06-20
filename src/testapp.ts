import cookieParser from 'cookie-parser';
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { HttpError } from 'http-errors';
import methodOverride from 'method-override';
import logger from 'morgan';
import commentRouter from './routes/comment';
import indexRouter from './routes/index';
import loginRouter from './routes/login';
import signUpRouter from './routes/signup';
import userRouter from './routes/user';


const app = express();

app.use(methodOverride('_method'))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const authTestSetup = function(){
  const _authTestVariable = {authenticated: true, member_status: 'privileged'};
  
  const toggleAuthTestVariable = function(authenticate:boolean=true, new_member_status: 'regular' | 'privileged' | 'admin'='privileged'){
      Object.assign(_authTestVariable, {authenticated: authenticate, member_status: new_member_status})
      return _authTestVariable
  };

  const isAuthenticated = function(req:Request, res:Response, next:NextFunction){
      const isAuth = function(){return _authTestVariable.authenticated};
      Object.assign(req, {isAuthenticated: isAuth});
      Object.assign(req, { user: {username: 'Jane Doe', member_status: _authTestVariable.member_status, _id: '200'} })
      next();
  };

  return {
      isAuthenticated,
      toggleAuthTestVariable
      
  }

}

export const {isAuthenticated, toggleAuthTestVariable} = authTestSetup();


app.use('/', [isAuthenticated, indexRouter]);
app.use('/user', userRouter);
app.use('/login',loginRouter);
app.use('/signup', signUpRouter);
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


export default app
