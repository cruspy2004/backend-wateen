import express from 'express';
import { createGroup, getAllGroups, getGroup } from '../controllers/groupController.js';
import { addMember, getPendingMembers, activateMembership } from '../controllers/memberController.js';
import { validateGroup, validateAddMember } from '../middleware/validation.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(auth);

// Group routes
router.post('/', validateGroup, createGroup);
router.get('/', getAllGroups);
router.get('/:id', getGroup);

// Member routes
router.post('/:groupId/members', validateAddMember, addMember);
router.get('/:groupId/members/pending', getPendingMembers);
router.patch('/:groupId/members/activate', activateMembership);

export default router;
