const compression = require('compression');
const helmet = require('helmet');

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
    const start = process.hrtime();
    
    res.on('finish', () => {
        const [seconds, nanoseconds] = process.hrtime(start);
        const duration = seconds * 1000 + nanoseconds / 1000000;
        
        // Log slow requests (>1000ms)
        if (duration > 1000) {
            console.warn(`Slow request: ${req.method} ${req.originalUrl} - ${duration.toFixed(2)}ms`);
        }
        
        // Set performance headers
        res.set('X-Response-Time', `${duration.toFixed(2)}ms`);
    });
    
    next();
};

// Memory usage monitoring
const memoryMonitor = () => {
    const usage = process.memoryUsage();
    const formatMemory = (bytes) => Math.round(bytes / 1024 / 1024 * 100) / 100;
    
    return {
        rss: formatMemory(usage.rss) + ' MB',
        heapTotal: formatMemory(usage.heapTotal) + ' MB',
        heapUsed: formatMemory(usage.heapUsed) + ' MB',
        external: formatMemory(usage.external) + ' MB'
    };
};

// Database query optimization middleware
const queryOptimizer = (req, res, next) => {
    // Add lean() to Mongoose queries for read-only operations
    const originalFind = req.Model?.find;
    const originalFindOne = req.Model?.findOne;
    
    if (req.method === 'GET' && req.Model) {
        req.Model.find = function(...args) {
            return originalFind.apply(this, args).lean();
        };
        
        req.Model.findOne = function(...args) {
            return originalFindOne.apply(this, args).lean();
        };
    }
    
    next();
};

// Response compression setup
const compressionSetup = compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
});

// Security headers setup
const securitySetup = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
});

// Request/Response size limits
const sizeLimits = {
    json: { limit: '10mb' },
    urlencoded: { limit: '10mb', extended: true }
};

module.exports = {
    performanceMonitor,
    memoryMonitor,
    queryOptimizer,
    compressionSetup,
    securitySetup,
    sizeLimits
};