import express from 'express';
import { deletePostController, postPostController, putPostController} from '../controllers/post';

const router = express.Router();

router.delete('/',deletePostController);
router.post('/', postPostController);
router.put('/', putPostController);

export default router;

