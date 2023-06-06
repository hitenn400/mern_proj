const ErrorHandler = require('../utils/errorhandler');
const User = require('../models/userModel');
const sendToken = require('../utils/jwtToken');
const crypto = require("crypto");
const sendEmail=require('../utils/sendEmail.js');
// Register a user

exports.registerUser=async(req,res,next)=>{
    try{
    const{name,email,password}=req.body;
    const user = await User.create({
        name,email,password,avatar:{
            public_id:"this is sample id",
            url:"profilePicUrl"
        }
    });
    sendToken(user,201,res);
}
    catch(error){
        res.status(500).json({
            success: false,
            error: error.message,
          });
    }
};
exports.loginUser=async(req,res,next)=>{
    try {
        const{email,password}=req.body;
        // check if user has given email and password both
        if(!email || !password){
            return next(new ErrorHandler("Please enter Email and password",400));
            
        }
        const user = await User.findOne({email}).select("+password");
        if(!user){
            return next(new ErrorHandler("Invalid email or password",401));
            
        }
        const isPasswordMatched=await user.comparePassword(password);
        if(!isPasswordMatched){
            return next(new ErrorHandler("Invalid email or password",401));
            
        }
        sendToken(user,200,res);
       


    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
          });
    }
}
exports.logoutUser=async(req,res)=>{
    try {
        res.cookie("token",null,{
            expires:new Date(Date.now()),
            httpOnly:true
        })
        res.status(200).json({
            success:true,
            message:"Logout successful"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
          });
    }
}
exports.forgotPassword=async(req,res)=>{
   
    try {
        const user = await User.findOne({email:req.body.email});
        if(!user){
            return res.status(404).json({
                message:"User not found"
            })
        };
        // Get reset password token;
        const resetToken= user.getResetPasswordToken();
        await user.save({validateBeforeSave:false});
        const resetPasswordUrl=`${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
        const message=`Your password reset token is :- \n\n 
        ${resetPasswordUrl} \n\n If you have not requested this email then,ignore it`
        try {
            await sendEmail({
                email:user.email,
                subject:`Ecommerce Password recovery`,
                message
            })
           res.status(200).json({
            success:true,
            message:`Email sent to ${user.email} successfully`
           })
        } catch (error) {
            user.resetPasswordToken=undefined;
            user.resetPasswordExpire=undefined;
            await user.save({validateBeforeSave:false});
            res.status(500).json({
                success: false,
                error: error.message,
              });
        }
        
    } catch (error) {
       
        res.status(500).json({
            success: false,
            error: error.message,
          });
    }
}
exports.resetPassword=async(req,res)=>{
    try {
        // creating token hash
        const resetPasswordToken=crypto.createHash("sha256").update(req.params.token).digest("hex");
        const user = await User.findOne({resetPasswordToken,resetPasswordExpire:{$gt:Date.now()}});
        if(!user){
            return res.status(404).json({
                message:"reset password token is invalid or has been expired"
            })
        };
        if(req.body.password!==req.body.confirmPassword){
            return res.status(400).json({
                message:"Password does not match"
            })
        };
        user.password=req.body.password;
        user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;
        await user.save();
        sendToken(user,200,res);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
          });
    }
}
exports.getUserDetails=async(req,res)=>{
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success:true,
            user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
          });
    }
}
exports.updatePassword=async(req,res)=>{
    try {
        const user = await User.findById(req.user.id).select("+password");
        const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
        if(!isPasswordMatched){
            return res.status(400).json({
                message:"Old password is incorrect"
            }); 
        }
        if(req.body.newPassword!=req.body.confirmPassword){
            return res.status(400).json({
                message:"Password does not match"
            }); 
        };
        user.password=req.body.newPassword;
        await user.save();
        sendToken(user,200,res);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
          });
    }
}
exports.updateProfile=async(req,res)=>{
    try {
        const newUserData={
            name:req.body.name,
            email:req.body.email
        }
        const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
            new:true,
            runValidators:true,
            useFindAndModify:false
        });
        res.status(200).json({
            success:true,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
          });
    }
}
// admin get all users
exports.getAllUser=async(req,res)=>{
    try {
        const user = await User.find();
        res.status(200).json({
            success:true,
            user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
          });
    }
}
// admin get single user
exports.getSingleUser=async(req,res)=>{
    try {
        const user = await User.findById(req.params.id);
        if(!user){
            return res.json({
                message:`User does not exist with ID:${req.params.id}`
            })
        }
        res.status(200).json({
            success:true,
            user
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
          });
    }
}
// update role --admin
exports.updateUserRole=async(req,res)=>{
    try {
        const newUserData={
            name:req.body.name,
            email:req.body.email,
            role:req.body.role
        }

        const user = await User.findById(req.params.id);
        if(!user){
            return res.status(400).json({
                message:"user not found"
            })
        }
        const userr = await User.findByIdAndUpdate(req.params.id,newUserData,{
            new:true,
            runValidators:true,
            useFindAndModify:false
        });

        res.status(200).json({
            success:true,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
          });
    }
}
// delete user --admin
exports.deleteUser=async(req,res)=>{
    try {
        
       const user = await User.findById(req.params.id);
       if(!user){
        return res.status(400).json({
            message:`user does not exist with id ${req.params.id}`
        })
       }
       await user.remove();
        res.status(200).json({
            success:true,
            message:"user deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
          });
    }
}