import express from 'express'
import {getLists, postList, updateLIst, deleteList, getListTasks, postTask, updateTask, deleteTask, getTasksFromList} from '../controllers/lists.js'
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, getLists);
router.post('/', authenticate, postList);
router.patch('/:id', authenticate, updateLIst);
router.delete('/:id', authenticate, deleteList);

router.get('/:listId/tasks', authenticate, getListTasks);
router.post('/:listId/tasks', authenticate, postTask);
router.patch('/:listId/tasks/:taskId', authenticate, updateTask);
router.delete('/:listId/tasks/:taskId', authenticate, deleteTask);
router.get('/:listId/tasks/:taskId', getTasksFromList);

export default router;