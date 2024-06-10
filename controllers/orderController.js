const Order=require("../models/orderModel")
const Product=require("../models/productModel")
const ErrorHandler=require("../utils/errorHandler")
const catchAsyncErrors=require("../middleware/catchAsyncErrors")
const User=require("../models/userModel");



exports.newOrder=catchAsyncErrors(async(req,res,next)=>{
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    }=req.body;

    const order=await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt:Date.now(),
        user:req.user._id
    })

    res.status(201).json({
        success:true,
        order
    })
})



exports.getSingleOrder=catchAsyncErrors(async(req, res, next)=>{
    const order=await Order.findById(req.params.id).populate("user", "name email")

    if(!order){
        return next(new ErrorHandler("Order not found with this id", 404))
    }

    res.status(200).json({
        success:true,
        order
    })
})


exports.myOrders=catchAsyncErrors(async(req, res, next)=>{
    const orders=await Order.find({user:req.user._id})

    res.status(200).json({
        success:true,
        orders
    })
})



exports.allOrders=catchAsyncErrors(async(req, res, next)=>{
    const orders=await Order.find()

    let totalAmount=0;

    orders.forEach((order)=>{
        totalAmount+=order.totalPrice
    })

    res.status(200).json({
        success:true,
        totalAmount,
        orders
    })
})


exports.updateOrder=catchAsyncErrors(async(req, res, next)=>{
    const order=await Order.findById(req.params.id)

    if(!order){
        return next(new ErrorHandler("Order not found with this id", 404))
    }

    if(order.orderStatus==="Delivered"){
        return next(new ErrorHandler("You have already delivered this order", 400))
    }

    if(req.body.status==="Shipped"){
        order.orderItems.forEach(async(i)=>{
            await updateStock(i.product, i.quantity)
        })
    }

    order.orderStatus=req.body.status;

    if(req.body.status==="Delivered"){
        order.deliveredAt=Date.now()
    }

    await order.save({validateBeforeSave:false})

    res.status(200).json({
        success:true,
        order
    })
})


async function updateStock(id, quantity){
    const product=await Product.findById(id);
    product.stock-=quantity;
    await product.save({validateBeforeSave:false});
}



exports.deleteOrder=catchAsyncErrors(async(req, res, next)=>{
    const order=await Order.findById(req.params.id)

    if(!order){
        return next(new ErrorHandler("Order not found with this id", 404))
    }

    await order.deleteOne()

    res.status(200).json({
        success:true,
        message:"Order deleted successfully"
    })
})