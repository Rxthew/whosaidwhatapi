import express from 'express';
import { putUserController } from '../controllers/user';

const router = express.Router();

router.put('/:id', putUserController);

export default router;