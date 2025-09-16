const redis = require('redis');
const client = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
});

client.on('error', (err) => {
    console.log('Redis Client Error', err);
});

// Generic cache middleware
const cache = (duration = 300) => {
    return async (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }

        const key = `cache:${req.originalUrl}:${req.user?.id || 'anonymous'}`;
        
        try {
            const cached = await client.get(key);
            
            if (cached) {
                return res.json(JSON.parse(cached));
            }
            
            // Store original json method
            const originalJson = res.json;
            
            // Override json method to cache response
            res.json = function(data) {
                // Cache the response
                client.setex(key, duration, JSON.stringify(data));
                
                // Call original json method
                return originalJson.call(this, data);
            };
            
            next();
        } catch (error) {
            console.error('Cache error:', error);
            next();
        }
    };
};

// Cache specific to tasks
const cacheUserTasks = cache(180); // 3 minutes

// Cache for weather data
const cacheWeatherData = cache(1800); // 30 minutes

// Cache for user profile
const cacheUserProfile = cache(600); // 10 minutes

// Clear cache for user
const clearUserCache = async (userId) => {
    try {
        const pattern = `cache:*:${userId}`;
        const keys = await client.keys(pattern);
        
        if (keys.length > 0) {
            await client.del(keys);
        }
    } catch (error) {
        console.error('Error clearing user cache:', error);
    }
};

// Clear specific cache key
const clearCache = async (key) => {
    try {
        await client.del(key);
    } catch (error) {
        console.error('Error clearing cache:', error);
    }
};

module.exports = {
    client,
    cache,
    cacheUserTasks,
    cacheWeatherData,
    cacheUserProfile,
    clearUserCache,
    clearCache
};