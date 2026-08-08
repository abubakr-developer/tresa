import { Router } from 'express';
import {
  getTasksByProject, getTask, createTask, updateTask, deleteTask, moveTask,
} from '../controllers/taskController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.use(auth);

router.get('/project/:projectId', getTasksByProject);
router.get('/:id', getTask);
router.post('/', createTask);
router.put('/:id', updateTask);
router.put('/:id/move', moveTask);
router.delete('/:id', deleteTask);

export default router;
