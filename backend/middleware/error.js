const { default: mongoose } = require('mongoose');
const ErrorHandler = require('../utils/errorhandler');

module.exports=(err,req,res,next)=>{
    err.statusCode=err.statusCode || 500;
    err.message = err.message || "Internal server error"
    // mongoose duplicate key error
    
    
    res.status(err.statusCode).json({
        success:false,
        message:err.message
    });
};