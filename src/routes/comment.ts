import express from 'express';
import { postCommentController, putCommentController } from '../controllers/comment';

const router = express.Router();

router.post('/', postCommentController);
router.put('/', putCommentController);

export default router;

