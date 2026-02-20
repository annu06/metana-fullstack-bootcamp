const winston = require('winston');
const { combine, timestamp, errors, json, colorize, simple } = winston.format;

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        errors({ stack: true }),
        timestamp(),
        json()
    ),
    defaultMeta: { service: 'mood-todo-app' },
    transports: [
        new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        new winston.transports.File({ 
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: combine(
            colorize(),
            simple()
        )
    }));
}

// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            userId: req.user?.id
        };
        
        if (res.statusCode >= 400) {
            logger.error('HTTP Error', logData);
        } else if (duration > 1000) {
            logger.warn('Slow Request', logData);
        } else {
            logger.info('HTTP Request', logData);
        }
    });
    
    next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
    logger.error('Application Error', {
        error: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        userId: req.user?.id,
        body: req.body
    });
    
    next(err);
};

module.exports = {
    logger,
    requestLogger,
    errorLogger
};