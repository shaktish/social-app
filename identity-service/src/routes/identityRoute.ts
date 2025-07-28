import express from 'express';
import { loginUser, logoutUser, refreshToken, registerUser } from '../controllers/identityController';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refreshToken', refreshToken);
router.post('/logout', logoutUser);


export default router;