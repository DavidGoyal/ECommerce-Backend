const express=require("express")
const { isAuthenticatedUser} = require("../middleware/auth");
const { processPayment, sendStripeKey } = require("../controllers/paymentController");

const router=express.Router()

router.route("/process/payment").post(isAuthenticatedUser,processPayment)

router.route("/stripeapikey").get(isAuthenticatedUser,sendStripeKey )



module.exports=router; 