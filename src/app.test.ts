import cookieParser from 'cookie-parser';
import express from 'express';
import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { HttpError } from 'http-errors';
import methodOverride from 'method-override';
import logger from 'morgan';
import indexRouter from './routes/index';


const app = express();

app.use(methodOverride('_method'))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);

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