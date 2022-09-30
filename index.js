const express = require("express");
const dbConnection = require("./dbconnect");
const app = express();
const bodyParser = require("body-parser");

const userRouter = require("./api/routes/user"); 
const adminRouter = require("./api/routes/admin");

app.use(bodyParser.urlencoded({extended:false}));
app.use(express.json());

app.use(function(req,res,next){
    req.dbConnection = dbConnection;
    next();
})


// routes
app.use('/user' ,userRouter);
app.use('/admin',adminRouter);

app.use((req, res, next) => {
    res.status(404).json({
        error: "bad request",
        message:"url not found"
    })
})




// database connection
dbConnection.connect(function(error){
    if(error){
        console.log("database connection failed")
    }
    else{
        console.log("Database connection Successfully")
    }
})


//port connection
const port = process.env.PORT || 2000

app.listen(port ,(error)=>{
    if(error){
        console.log("Port connection failed")
    }
    else{
        console.log(`App is running in ${port}`)
    }
})