import express from 'express';
import { deleteCommentController, postCommentController, putCommentController } from '../controllers/comment';

const router = express.Router();

router.delete('/',deleteCommentController);
router.post('/', postCommentController);
router.put('/', putCommentController);

export default router;

