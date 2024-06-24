const express=require("express")
const app=express();
const dotenv=require("dotenv")
const cookieParser=require("cookie-parser")
const bodyParser=require("body-parser")
const fileUpload=require("express-fileupload")
const path=require("path")
const cors=require("cors")

const midddleware=require("./middleware/error")


dotenv.config({path:".env"})

app.use(cors({
    origin:[process.env.FRONTEND_URL],
    credentials:true
}))

const productRouter=require("./routes/productRoute")
const userRouter=require("./routes/userRoute")
const orderRouter=require("./routes/orderRoute")
const paymentRouter=require("./routes/paymentRoute")

app.use(express.json({limit:'50mb'}))
app.use(cookieParser())
app.use(bodyParser.urlencoded({limit:'50mb',extended:true}))
app.use(fileUpload())


app.use("/api/v1",productRouter);
app.use("/api/v1", userRouter);
app.use("/api/v1",orderRouter);
app.use("/api/v1",paymentRouter)



app.use(midddleware);


module.exports=app;