import express from 'express';
import { register, login, getProfile } from '../controllers/authController.js';
import { validateRegistration, validateLogin } from '../middleware/validation.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);

// Protected routes
router.get('/profile', auth, getProfile);

export default router;
