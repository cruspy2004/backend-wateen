import express from 'express';
import { 
    getQRCode, 
    getConnectionStatus, 
    createWhatsAppGroup, 
    addMembersToGroup, 
    removeMembersFromGroup, 
    getWhatsAppGroups, 
    getGroupInfo 
} from '../controllers/whatsappController.js';
import auth from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';
import { validateWhatsAppGroup, validateWhatsAppGroupMembers } from '../middleware/validation.js';

const router = express.Router();

// Rate limiting for WhatsApp API calls
const whatsappRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many WhatsApp API requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict rate limiting for group operations
const groupOperationRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10, // limit each IP to 10 group operations per 5 minutes
    message: {
        success: false,
        message: 'Too many group operations, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to all routes
router.use(whatsappRateLimit);

// WhatsApp Connection Routes
router.get('/qr-code', getQRCode);
router.get('/status', getConnectionStatus);

// WhatsApp Group Management Routes (Protected)
router.post('/groups/create', auth, groupOperationRateLimit, validateWhatsAppGroup, createWhatsAppGroup);
router.post('/groups/:groupId/members/add', auth, groupOperationRateLimit, validateWhatsAppGroupMembers, addMembersToGroup);
router.delete('/groups/:groupId/members/remove', auth, groupOperationRateLimit, validateWhatsAppGroupMembers, removeMembersFromGroup);
router.get('/groups', auth, getWhatsAppGroups);
router.get('/groups/:groupId', auth, getGroupInfo);

export default router;
