import express from 'express';
import adminController from '../controllers';

const router = express.Router();

router.get('/admin', adminController);

export default router;

