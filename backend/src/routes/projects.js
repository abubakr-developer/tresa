import { Router } from 'express';
import {
  getProjects, getProject, createProject, updateProject,
  deleteProject, inviteMember, removeMember,
} from '../controllers/projectController.js';
import auth from '../middleware/auth.js';

const router = Router();

router.use(auth);

router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/invite', inviteMember);
router.delete('/:id/members/:userId', removeMember);

export default router;
