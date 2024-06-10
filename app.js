const express=require("express")
const app=express();
const dotenv=require("dotenv")
const cookieParser=require("cookie-parser")
const bodyParser=require("body-parser")
const fileUpload=require("express-fileupload")
const path=require("path")

const midddleware=require("./middleware/error")

const pathFile=path.join(__dirname, "/config/config.env")

dotenv.config({path:pathFile})

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


app.use(express.static(path.join(__dirname,"../frontend/dist")))

app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"))
})


app.use(midddleware);


module.exports=app;