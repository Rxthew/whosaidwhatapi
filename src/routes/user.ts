import express from 'express';
import { deleteUserController, putUserController } from '../controllers/user';

const router = express.Router();

router.put('/:id', putUserController);
router.delete('/:id',deleteUserController);

export default router;