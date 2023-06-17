import express from 'express';
import { putUserController } from '../controllers/user';

const router = express.Router();

router.put('/', putUserController);

export default router;