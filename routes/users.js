import express from 'express';
import { searchUsers } from '../controllers/memberController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(auth);

// Search users
router.get('/search', searchUsers);

export default router;
