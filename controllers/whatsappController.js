import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode';
import path from 'path';
import fs from 'fs';
import WhatsAppLogger from '../utils/whatsappLogger.js';

let client = null;
let currentQR = null;
let isClientReady = false;

// Initialize WhatsApp client
const initializeClient = () => {
    if (!client) {
        // Create sessions directory if it doesn't exist
        const sessionsDir = path.join(process.cwd(), 'whatsapp-sessions');
        if (!fs.existsSync(sessionsDir)) {
            fs.mkdirSync(sessionsDir, { recursive: true });
        }

        client = new Client({
            authStrategy: new LocalAuth({
                clientId: 'messaging-coordination-api',
                dataPath: sessionsDir
            }),
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            }
        });

        client.on('qr', (qr) => {
            WhatsAppLogger.logConnection('QR_GENERATED', { qrLength: qr.length });
            currentQR = qr;
        });

        client.on('ready', () => {
            WhatsAppLogger.logConnection('CONNECTED');
            isClientReady = true;
        });

        client.on('authenticated', () => {
            WhatsAppLogger.logConnection('AUTHENTICATED');
        });

        client.on('auth_failure', (msg) => {
            WhatsAppLogger.logConnection('AUTH_FAILURE', { reason: msg });
        });

        client.on('disconnected', (reason) => {
            WhatsAppLogger.logConnection('DISCONNECTED', { reason });
            isClientReady = false;
            currentQR = null;
        });

        client.on('message', (message) => {
            WhatsAppLogger.debug('Message received', {
                from: message.from,
                type: message.type,
                isGroup: message.isGroup
            });
        });

        client.initialize();
    }
};

// Initialize client when module loads
initializeClient();

export const getQRCode = async (req, res) => {
    try {
        if (isClientReady) {
            return res.status(200).json({
                success: true,
                message: 'WhatsApp is already connected',
                connected: true
            });
        }

        if (!currentQR) {
            // If no QR code yet, wait a bit and try again
            setTimeout(() => {
                if (currentQR) {
                    qrcode.toDataURL(currentQR)
                        .then(qrCodeImage => {
                            res.status(200).json({
                                success: true,
                                qrCodeImage,
                                connected: false
                            });
                        })
                        .catch(error => {
                            res.status(500).json({
                                success: false,
                                message: 'Failed to generate QR code',
                                error: error.message
                            });
                        });
                } else {
                    res.status(500).json({
                        success: false,
                        message: 'QR code not available yet. Please try again.'
                    });
                }
            }, 2000);
        } else {
            const qrCodeImage = await qrcode.toDataURL(currentQR);
            res.status(200).json({
                success: true,
                qrCodeImage,
                connected: false
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to generate QR code',
            error: error.message
        });
    }
};

export const getConnectionStatus = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            connected: isClientReady,
            message: isClientReady ? 'WhatsApp is connected' : 'WhatsApp is not connected'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get connection status',
            error: error.message
        });
    }
};

// Helper function to validate phone number format
const validatePhoneNumber = (phone) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check if it's a valid length (10-15 digits)
    if (cleaned.length < 10 || cleaned.length > 15) {
        WhatsAppLogger.logPhoneValidation(phone, false);
        return null;
    }
    
    let formattedNumber;
    
    // Add country code if not present (assuming +1 for US/Canada, modify as needed)
    if (cleaned.length === 10) {
        formattedNumber = `1${cleaned}@c.us`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
        formattedNumber = `${cleaned}@c.us`;
    } else {
        formattedNumber = `${cleaned}@c.us`;
    }
    
    WhatsAppLogger.logPhoneValidation(phone, true);
    return formattedNumber;
};

// Create WhatsApp group
export const createWhatsAppGroup = async (req, res) => {
    try {
        if (!isClientReady) {
            return res.status(400).json({
                success: false,
                message: 'WhatsApp client is not connected. Please scan QR code first.'
            });
        }

        const { groupName, participants } = req.body;

        if (!groupName || !participants || !Array.isArray(participants)) {
            return res.status(400).json({
                success: false,
                message: 'Group name and participants array are required'
            });
        }

        if (participants.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one participant is required'
            });
        }

        // Validate and format phone numbers
        const formattedParticipants = [];
        const invalidNumbers = [];
        
        for (const participant of participants) {
            const formatted = validatePhoneNumber(participant);
            if (formatted) {
                formattedParticipants.push(formatted);
            } else {
                invalidNumbers.push(participant);
            }
        }

        if (invalidNumbers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone numbers found',
                invalidNumbers
            });
        }

        // Create the group
        const group = await client.createGroup(groupName, formattedParticipants);

        const groupData = {
            groupId: group.gid._serialized,
            groupName: groupName,
            participants: formattedParticipants,
            createdAt: new Date().toISOString()
        };

        WhatsAppLogger.logGroupOperation('CREATE_GROUP', group.gid._serialized, req.user.id, 'SUCCESS', groupData);

        res.status(201).json({
            success: true,
            message: 'WhatsApp group created successfully',
            data: groupData
        });
    } catch (error) {
        WhatsAppLogger.logGroupOperation('CREATE_GROUP', 'UNKNOWN', req.user.id, 'ERROR', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Failed to create WhatsApp group',
            error: error.message
        });
    }
};

// Add members to WhatsApp group
export const addMembersToGroup = async (req, res) => {
    try {
        if (!isClientReady) {
            return res.status(400).json({
                success: false,
                message: 'WhatsApp client is not connected. Please scan QR code first.'
            });
        }

        const { groupId } = req.params;
        const { participants } = req.body;

        if (!participants || !Array.isArray(participants)) {
            return res.status(400).json({
                success: false,
                message: 'Participants array is required'
            });
        }

        if (participants.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one participant is required'
            });
        }

        // Validate and format phone numbers
        const formattedParticipants = [];
        const invalidNumbers = [];
        
        for (const participant of participants) {
            const formatted = validatePhoneNumber(participant);
            if (formatted) {
                formattedParticipants.push(formatted);
            } else {
                invalidNumbers.push(participant);
            }
        }

        if (invalidNumbers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone numbers found',
                invalidNumbers
            });
        }

        // Add participants to group
        const result = await client.addParticipant(groupId, formattedParticipants);

        res.status(200).json({
            success: true,
            message: 'Members added to WhatsApp group successfully',
            data: {
                groupId,
                addedParticipants: formattedParticipants,
                result
            }
        });
    } catch (error) {
        console.error('Error adding members to WhatsApp group:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add members to WhatsApp group',
            error: error.message
        });
    }
};

// Remove members from WhatsApp group
export const removeMembersFromGroup = async (req, res) => {
    try {
        if (!isClientReady) {
            return res.status(400).json({
                success: false,
                message: 'WhatsApp client is not connected. Please scan QR code first.'
            });
        }

        const { groupId } = req.params;
        const { participants } = req.body;

        if (!participants || !Array.isArray(participants)) {
            return res.status(400).json({
                success: false,
                message: 'Participants array is required'
            });
        }

        if (participants.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one participant is required'
            });
        }

        // Validate and format phone numbers
        const formattedParticipants = [];
        const invalidNumbers = [];
        
        for (const participant of participants) {
            const formatted = validatePhoneNumber(participant);
            if (formatted) {
                formattedParticipants.push(formatted);
            } else {
                invalidNumbers.push(participant);
            }
        }

        if (invalidNumbers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone numbers found',
                invalidNumbers
            });
        }

        // Remove participants from group
        const result = await client.removeParticipant(groupId, formattedParticipants);

        res.status(200).json({
            success: true,
            message: 'Members removed from WhatsApp group successfully',
            data: {
                groupId,
                removedParticipants: formattedParticipants,
                result
            }
        });
    } catch (error) {
        console.error('Error removing members from WhatsApp group:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove members from WhatsApp group',
            error: error.message
        });
    }
};

// Get WhatsApp groups
export const getWhatsAppGroups = async (req, res) => {
    try {
        if (!isClientReady) {
            return res.status(400).json({
                success: false,
                message: 'WhatsApp client is not connected. Please scan QR code first.'
            });
        }

        const chats = await client.getChats();
        const groups = chats.filter(chat => chat.isGroup);

        const groupsData = groups.map(group => ({
            id: group.id._serialized,
            name: group.name,
            description: group.description,
            participantCount: group.participants.length,
            createdAt: group.createdAt,
            isOwner: group.owner ? group.owner._serialized === client.info.wid._serialized : false
        }));

        res.status(200).json({
            success: true,
            message: 'WhatsApp groups retrieved successfully',
            data: {
                groups: groupsData,
                totalGroups: groupsData.length
            }
        });
    } catch (error) {
        console.error('Error getting WhatsApp groups:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get WhatsApp groups',
            error: error.message
        });
    }
};

// Get group info
export const getGroupInfo = async (req, res) => {
    try {
        if (!isClientReady) {
            return res.status(400).json({
                success: false,
                message: 'WhatsApp client is not connected. Please scan QR code first.'
            });
        }

        const { groupId } = req.params;
        const chat = await client.getChatById(groupId);

        if (!chat.isGroup) {
            return res.status(400).json({
                success: false,
                message: 'The provided ID is not a group'
            });
        }

        const participants = chat.participants.map(participant => ({
            id: participant.id._serialized,
            isAdmin: participant.isAdmin,
            isSuperAdmin: participant.isSuperAdmin
        }));

        res.status(200).json({
            success: true,
            message: 'Group info retrieved successfully',
            data: {
                id: chat.id._serialized,
                name: chat.name,
                description: chat.description,
                participants,
                participantCount: participants.length,
                createdAt: chat.createdAt,
                isOwner: chat.owner ? chat.owner._serialized === client.info.wid._serialized : false
            }
        });
    } catch (error) {
        console.error('Error getting group info:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get group info',
            error: error.message
        });
    }
};
