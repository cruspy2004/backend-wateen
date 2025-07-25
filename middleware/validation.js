import { body, validationResult } from 'express-validator';

// Validation middleware factory
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  
  next();
};

// User registration validation
const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validate
];

// User login validation
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

// Group creation validation
const validateGroup = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Group name must be between 2 and 100 characters'),
  validate
];

// Message creation validation
const validateMessage = [
  body('groupId')
    .isInt({ min: 1 })
    .withMessage('Valid group ID is required'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message content is required'),
  validate
];

// Add member validation
const validateAddMember = [
  body('userId')
    .isInt({ min: 1 })
    .withMessage('Valid user ID is required'),
  body('role')
    .optional()
    .isIn(['admin', 'member'])
    .withMessage('Role must be either admin or member'),
  validate
];

// Helper function to validate phone number format
const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[\+]?[1-9]?[0-9]{7,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// WhatsApp group creation validation
const validateWhatsAppGroup = [
  body('groupName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Group name must be between 2 and 100 characters'),
  body('participants')
    .isArray({ min: 1 })
    .withMessage('At least one participant is required'),
  body('participants.*')
    .custom((value) => {
      if (!validatePhoneNumber(value)) {
        throw new Error('Invalid phone number format');
      }
      return true;
    }),
  validate
];

// WhatsApp group members validation
const validateWhatsAppGroupMembers = [
  body('participants')
    .isArray({ min: 1 })
    .withMessage('At least one participant is required'),
  body('participants.*')
    .custom((value) => {
      if (!validatePhoneNumber(value)) {
        throw new Error('Invalid phone number format');
      }
      return true;
    }),
  validate
];

export {
  validateRegistration,
  validateLogin,
  validateGroup,
  validateMessage,
  validateAddMember,
  validateWhatsAppGroup,
  validateWhatsAppGroupMembers
};
