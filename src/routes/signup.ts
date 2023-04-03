import express from 'express';
import {Request, Response, NextFunction} from 'express';

const router = express.Router();

router.get('/', function(req:Request, res:Response, next:NextFunction) {
  res.json({test: 'tested'});
});

export default router;
