import express from 'express'
import { getLists, postList, updateLIst, deleteList, getListTasks, postTask, updateTask, deleteTask, getTasksFromList, userSignUp, userLogIn, getAccessToken, deleteSession } from '../controllers/index.js';
import { verifySession } from '../middleware/auth.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/lists', authenticate, getLists);
router.post('/lists', authenticate, postList);
router.patch('/lists/:id', authenticate, updateLIst);
router.delete('/lists/:id', authenticate, deleteList);

router.get('/lists/:listId/tasks', authenticate, getListTasks);
router.post('/lists/:listId/tasks', authenticate, postTask);
router.patch('/lists/:listId/tasks/:taskId', authenticate, updateTask);
router.delete('/lists/:listId/tasks/:taskId', authenticate, deleteTask);
router.get('/lists/:listId/tasks/:taskId', getTasksFromList);

router.post('/users', userSignUp);
router.post('/users/login', userLogIn);
router.delete('/users/session', verifySession, deleteSession);
router.get('/users/me/access-token', verifySession, getAccessToken);

export default router;