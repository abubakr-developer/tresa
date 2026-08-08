import { Router } from 'express';
import { getComments, createComment, updateComment, deleteComment } from '../controllers/commentController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.use(auth);

router.get('/task/:taskId', getComments);
router.post('/task/:taskId', createComment);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);

export default router;
