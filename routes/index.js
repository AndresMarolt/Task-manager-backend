import express from 'express'
import usersRoutes from './users.js'
import listsRoutes from './lists.js'
const router = express.Router();

router.use('/users', usersRoutes);
router.use('/lists', listsRoutes);

export default router;