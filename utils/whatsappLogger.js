import fs from 'fs';
import path from 'path';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// WhatsApp log file path
const whatsappLogFile = path.join(logsDir, 'whatsapp.log');

// Logger levels
const LOG_LEVELS = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    DEBUG: 'DEBUG'
};

// Format log message
const formatLogMessage = (level, message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level,
        message,
        data: data ? JSON.stringify(data) : null
    };
    
    return JSON.stringify(logEntry) + '\n';
};

// Write to log file and console
const writeLog = (level, message, data = null) => {
    const logMessage = formatLogMessage(level, message, data);
    
    // Write to file
    fs.appendFileSync(whatsappLogFile, logMessage);
    
    // Also log to console with color coding
    const colorCodes = {
        ERROR: '\x1b[31m',   // Red
        WARN: '\x1b[33m',    // Yellow
        INFO: '\x1b[36m',    // Cyan
        DEBUG: '\x1b[35m'    // Magenta
    };
    
    const resetCode = '\x1b[0m';
    const coloredLevel = `${colorCodes[level]}[${level}]${resetCode}`;
    
    console.log(`${coloredLevel} ${new Date().toISOString()} - ${message}`, data || '');
};

// WhatsApp Logger class
class WhatsAppLogger {
    static error(message, data = null) {
        writeLog(LOG_LEVELS.ERROR, message, data);
    }
    
    static warn(message, data = null) {
        writeLog(LOG_LEVELS.WARN, message, data);
    }
    
    static info(message, data = null) {
        writeLog(LOG_LEVELS.INFO, message, data);
    }
    
    static debug(message, data = null) {
        writeLog(LOG_LEVELS.DEBUG, message, data);
    }
    
    // Log WhatsApp API operations
    static logApiOperation(operation, status, data = null) {
        const message = `WhatsApp API: ${operation} - ${status}`;
        
        if (status === 'SUCCESS') {
            this.info(message, data);
        } else if (status === 'ERROR') {
            this.error(message, data);
        } else {
            this.warn(message, data);
        }
    }
    
    // Log group operations
    static logGroupOperation(operation, groupId, userId, status, data = null) {
        const message = `Group Operation: ${operation} - Group: ${groupId} - User: ${userId} - Status: ${status}`;
        
        if (status === 'SUCCESS') {
            this.info(message, data);
        } else {
            this.error(message, data);
        }
    }
    
    // Log connection events
    static logConnection(event, data = null) {
        const message = `WhatsApp Connection: ${event}`;
        
        if (event === 'CONNECTED' || event === 'AUTHENTICATED') {
            this.info(message, data);
        } else if (event === 'DISCONNECTED' || event === 'AUTH_FAILURE') {
            this.error(message, data);
        } else {
            this.debug(message, data);
        }
    }
    
    // Log phone number validation
    static logPhoneValidation(phone, isValid) {
        const message = `Phone validation: ${phone} - ${isValid ? 'VALID' : 'INVALID'}`;
        
        if (isValid) {
            this.debug(message);
        } else {
            this.warn(message);
        }
    }
}

export default WhatsAppLogger;
