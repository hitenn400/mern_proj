const Product = require('../models/productModel');
const Apifeatures = require('../utils/apifeatures');
const ErrorHandler = require('../utils/errorhandler');


// create product admin route
exports.createProduct=async(req,res,next)=>{
    try {
        req.body.user = req.user.id;
        const product = await Product.create(req.body);
        res.status(200).json({
            success:true,
            product
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
          });
    }
   
}
// get all products
exports.getAllProducts=async(req,res)=>{
    try {
        const productsCount = await Product.countDocuments();
        const resultPerPage=6;
         const apifeatures= new Apifeatures(Product.find(),req.query).search().filter().pagination(resultPerPage);
        const product = await apifeatures.query;
        // const product = await Product.find({name:{"$regex":req.query.keyword,"$options":"i"}});
    
    res.status(200).json({
        success:true,
        product,
        productsCount,
        resultPerPage
    })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
          });
    }
    
}

// Update product -- Admin
exports.updateProduct=async(req,res,next)=>{
    try {
        let product = await Product.findById(req.params.id);
        if(!product){
            return res.status(500).json({
                success:false,
                message:"product not found"
            });
    
        }
        product = await Product.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true,
            useFindAndModify:false
        });
        res.status(200).json({
            success:true,
            product
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
          });
    }
  
};
// delete product

exports.deleteProduct=async(req,res,next)=>{
    try {
        const product = await Product.findById(req.params.id);
    if(!product){
        return res.status(500).json({
            success:false,
            message:"product not found"
        })
    }
    await product.remove();
    res.status(200).json({
        success:true,
        message:"Product deleted successfully"
    })   
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
          });
    }
    
}
exports.getProductDetails=async(req,res,next)=>{
    try {
       
        const product = await Product.findById(req.params.id);
    if(!product){
        return next(new ErrorHandler("Product not found",404))
    }
    res.status(200).json({
        success:true,
        product
    })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
          });
    }
    
}
// create/update review
exports.createProductReview=async(req,res)=>{
    try {
        const {rating,comment,productId}=req.body;
        const review = {
            user:req.user._id,
            name:req.user.name,
            rating:Number(rating),
            comment
        }
        const product = await Product.findById(productId);
        const isReviewed = product.reviews.find(
            (rev)=>rev.user.toString()===req.user._id.toString()
        );
        if(isReviewed){
            product.reviews.forEach((rev)=>{
                if(rev.user.toString()===req.user._id.toString()){
                    rev.rating=rating,
                    rev.comment=comment;

                } 
            })
        }
        else{
            product.reviews.push(review);
            product.numOfReviews=product.reviews.length;
        }
        let avg = 0;
        product.reviews.forEach((rev)=>{
            avg+=rev.rating;
        })
        product.ratings =avg/product.reviews.length;
        await product.save({validateBeforeSave:false});
        res.status(200).json({
            success:true
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
          });
    }
};

// get reviews of product
exports.getProductReviews=async(req,res)=>{
    try {
        const product = await Product.findById(req.query.id);
        if(!product){
            return res.status(500).json({
                success:false,
                message:"product not found"
            })
        }
        res.status(200).json({
            success:true,
            reviews:product.reviews 
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
          });
    }
};
// delete review
exports.deleteReview=async(req,res)=>{
    try {
        const product = await Product.findById(req.query.productId);
        if(!product){
            return res.status(500).json({
                success:false,
                message:"product not found"
            })
        }
        const reviews = product.reviews.filter(rev=>rev._id.toString()!==req.query.id
        );
        let avg = 0;
        reviews.forEach((rev)=>{
            avg+=rev.rating;
        });
        const ratings =avg/reviews.length;
        const numOfReviews = reviews.length;
        await Product.findByIdAndUpdate(req.query.productId,{
            reviews,ratings,numOfReviews
        },
        {
            new:true,
            runValidators:true,
            useFindAndModify:false
        })
        res.status(200).json({
            success:true
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
          });
    }
};