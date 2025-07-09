import express from 'express';
import { composeMessage, getGroupMessages } from '../controllers/messageController.js';
import { validateMessage } from '../middleware/validation.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(auth);

// Message routes
router.post('/', validateMessage, composeMessage);
router.get('/group/:groupId', getGroupMessages);

export default router;
