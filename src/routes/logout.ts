import express from 'express';
import { logoutController } from '../controllers/logout';

const router = express.Router();

router.get('/', logoutController);

export default router;
