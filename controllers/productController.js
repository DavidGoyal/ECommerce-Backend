const Product=require("../models/productModel")
const ErrorHandler=require("../utils/errorHandler")
const catchAsyncErrors=require("../middleware/catchAsyncErrors")
const ApiFeatures=require("../utils/apifeatures")
const cloudinary=require("cloudinary")


exports.createProduct=catchAsyncErrors(async(req,res,next)=>{
    let images=[];
    
    if(typeof req.body.images==="string"){
        images.push(req.body.images);
    } else if (Array.isArray(req.body.images)) {
        images = req.body.images;
    } else {
        return next(new ErrorHandler("Invalid Image Format",400));
    }

    let imagesLinks=[];

    for(let i=0; i<images.length; i++){
        const result=await cloudinary.v2.uploader.upload(images[i], {
            folder:"products"
        });

        imagesLinks.push({
            public_id:result.public_id,
            url:result.secure_url
        })
    }

    req.body.images=imagesLinks;
    req.body.user=req.user.id;
    const product=await Product.create(req.body);

    res.status(201).json({
        success:true,
        product
    })
})



exports.getAllProducts=catchAsyncErrors(async(req,res,next)=>{
    const resultPerPage=8;
    const productsCount=await Product.countDocuments();
    const apiFeatures=new ApiFeatures(Product.find(),req.query).search().filter();
    let products=await apiFeatures.query;
    let filteredProductsCount=products.length;
    apiFeatures.pagination(resultPerPage);
    products=await apiFeatures.query.clone();


    res.status(200).json({
        success:true,
        products,
        productsCount,
        resultPerPage,
        filteredProductsCount
    })
})


exports.updateProduct=catchAsyncErrors(async(req,res,next)=>{
    let product=await Product.findById(req.params.id)
    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }


    let images=[];
    
    if(typeof req.body.images==="string"){
        images.push(req.body.images);
    }else{
        images=req.body.images;
    }


    if(images!==undefined){
        for (let index = 0; index < product.images.length; index++) {
            await cloudinary.v2.uploader.destroy(product.images[index].public_id)
        }

        let imagesLinks=[];

        for(let i=0; i<images.length; i++){
            const result=await cloudinary.v2.uploader.upload(images[i], {
                folder:"products"
            });

            imagesLinks.push({
                public_id:result.public_id,
                url:result.secure_url
            })
        }

        req.body.images=imagesLinks;
    }


    product=await Product.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true,useFindAndModify:false});

    res.status(200).json({
        success:true,
        product
    })
})


exports.deleteProduct=catchAsyncErrors(async(req,res,next)=>{
    const product=await Product.findById(req.params.id)
    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }

    for (let index = 0; index < product.images.length; index++) {
        await cloudinary.v2.uploader.destroy(product.images[index].public_id)
    }

    await product.deleteOne();
    res.status(200).json({
        success:true,
        message:"Product deleted successfully"
    })
})


exports.getSingleProduct=catchAsyncErrors(async(req,res,next)=>{
    const product=await Product.findById(req.params.id)
    if(!product){
        return next(new ErrorHandler("Product not found",404));
    }

    res.status(200).json({
        success:true,
        product,
    })
})


exports.addReview=catchAsyncErrors(async(req, res, next)=>{
    const {rating, comments, productId}=req.body;

    const review={
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comments
    }

    const product=await Product.findById(productId);
    const isReviewed=product.reviews.find((rev)=>rev.user.toString()===req.user._id.toString());

    if(isReviewed){
        product.reviews.forEach((rev)=>{
            if(rev.user.toString()===req.user._id.toString())
            (rev.rating=rating),
            (rev.comments=comments)
        })
    }
    else{
        product.reviews.push(review);
        product.noOfReviews=product.reviews.length
    }

    let avg=0;

    product.reviews.forEach((rev)=>{
        avg+=rev.rating;
    })

    product.ratings=avg/product.reviews.length;

    await product.save({validateBeforeSave:false});

    res.status(200).json({
        success:true
    })
})


exports.getAllReviews=catchAsyncErrors(async(req, res, next)=>{
    const product=await Product.findById(req.query.id);

    if(!product){
        return next(new ErrorHandler("Product not found", 404));
    }


    res.status(200).json({
        success:true,
        reviews:product.reviews
    })
})


exports.deleteReview=catchAsyncErrors(async(req, res, next)=>{
    const product=await Product.findById(req.query.productId);

    if(!product){
        return next(new ErrorHandler("Product not found", 404));
    }

    const reviews=product.reviews.filter((rev)=>rev._id.toString()!==req.query.id.toString());


    if (reviews.length === 0) {
        await Product.findByIdAndUpdate(
            req.query.productId,
            {
                reviews: [],
                ratings: 0,
                noOfReviews: 0
            },
            {
                new: true,
                runValidators: true,
                useFindAndModify: false,
            }
        );

        return res.status(200).json({
            success: true,
        });
    }


    let avg=0;

    reviews.forEach((rev)=>{
        avg+=rev.rating;
    })

    let length=reviews.length>0?reviews.length:1;
    const ratings=avg/length;

    const noOfReviews=length;

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        noOfReviews
    }, 
    {
        new:true,
        runValidators:true,
        useFindAndModify:false
    });

    res.status(200).json({
        success:true
    })
})


exports.getAllAdminProducts=catchAsyncErrors(async(req,res,next)=>{
    const products=await Product.find();

    res.status(200).json({
        success:true,
        products,
    })
})