import express from 'express';
import { postCommentController } from '../controllers/comment';

const router = express.Router();

router.post('/', postCommentController);

export default router;

