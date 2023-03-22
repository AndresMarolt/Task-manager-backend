import express from 'express'
import {userSignUp, userLogIn, getAccessToken, deleteSession} from '../controllers/auth.js'
import { verifySession } from '../middleware/auth.js';

const router = express.Router();

router.post('/', userSignUp);
router.post('/login', userLogIn);
router.delete('/session', verifySession, deleteSession);
router.get('/me/access-token', verifySession, getAccessToken);

export default router;