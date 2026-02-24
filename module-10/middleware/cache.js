// Simple in-memory cache for demonstration
const cache = new Map();

// Basic cache middleware
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    const key = req.originalUrl;
    const cached = cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < duration * 1000) {
      return res.json(cached.data);
    }
    
    const originalJson = res.json;
    res.json = function(data) {
      cache.set(key, {
        data,
        timestamp: Date.now()
      });
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Cache user tasks
const cacheUserTasks = (req, res, next) => {
  if (req.user) {
    const key = `tasks_${req.user.id}`;
    req.cacheKey = key;
  }
  next();
};

// Clear cache
const clearCache = (pattern = null) => {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
};

module.exports = {
  cache: cacheMiddleware,
  cacheUserTasks,
  clearCache
};