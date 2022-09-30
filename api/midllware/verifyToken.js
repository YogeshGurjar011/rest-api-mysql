// const { request, response } = require("express")
const jwt = require("jsonwebtoken");


const verifyToken = (request , response , next)=>{
    const authorizationHeader = request.headers.authorization;
    if(authorizationHeader){
        const Token = authorizationHeader.split(" ")[1];
        jwt.verify(Token,"thisissecretkey",(error,payload)=>{
            if(error){
                response.send("please provide valid token")
            }
            else{
                next()
            }
        })
    }
    else{
        response.sendStatus(403);
    }


    // try {
    //     const token = req.headers.authorization.split(" ")[1];
    //     console.log(token);
    //     const verify = jwt.verify(token,'1234')
    //     console.log(verify)
    //     console.log(verify.userType)
    //     if(error){
    //         return res.status(401).json({
    //             message : "Only admin can change"
    //         })
    //     }
    //     else{
    //        next();
    //     }
      
    // }
    // catch (error) {
    //     return res.status(401).json({
    //         message: "invalid token"
    //     })
    // }
}

module.exports = verifyToken;