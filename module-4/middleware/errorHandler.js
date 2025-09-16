// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    // Default error
    let error = {
        success: false,
        message: 'Server Error',
        status: 500
    };
    
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        error.message = 'Resource not found';
        error.status = 404;
    }
    
    // Mongoose duplicate key
    if (err.code === 11000) {
        error.message = 'Duplicate field value entered';
        error.status = 400;
    }
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        error.message = Object.values(err.errors).map(val => val.message).join(', ');
        error.status = 400;
    }
    
    res.status(error.status).json({
        success: false,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;