const Order=require("../models/orderModel")
const Product=require("../models/productModel")
const ErrorHandler=require("../utils/errorHandler")
const catchAsyncErrors=require("../middleware/catchAsyncErrors")
const User=require("../models/userModel");
const stripe=require("stripe")(process.env.STRIPE_SECRET_KEY)


exports.processPayment=catchAsyncErrors(async(req,res,next)=>{
    const payment=await stripe.paymentIntents.create({
        amount:req.body.amount,
        currency:"inr",
        metadata:{
            company:"Ecommerce"
        }
    })

    res.status(200).json({
        success:true,
        client_secret:payment.client_secret
    })
})


exports.sendStripeKey=catchAsyncErrors(async(req, res, next)=>{
    res.status(200).json({
        stripeApiKey:process.env.STRIPE_API_KEY
    })
})