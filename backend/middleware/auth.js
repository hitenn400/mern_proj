const jwt = require("jsonwebtoken");
const User = require('../models/userModel')
exports.isAuthenticated=async(req,res,next)=>{
    try {
        const {token} = req.cookies;
        if(!token){
            return res.status(401).json({
                message:"Please login to access this resource"
            });
        }
        const decodedData = jwt.verify(token,process.env.JWT_SECRET);
        req.user= await User.findById(decodedData.id);
        next();

    } catch (error) {
        res.json({
            success:false,
            error:error.message
        })
    }
}
exports.authorizeRoles=(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return res.status(403).json({
                message:`Role: ${req.user.role} is not allowed to access this resource`
            })
        }
        next();
    }
}