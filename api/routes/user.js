const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verifyToken = require("../midllware/verifyToken");

const storage = multer.diskStorage({
    destination: "./api/images",
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}.${path.extname(file.originalname)}`)
    }
});

// img filter
// const isImage = (req,file,cb)=>{
//     // console.log(req.filename)
//     if(file.mimetype.startsWith("image")){
//         cb(null,true)
//     }
//     else{
//         cb(null,Error("only image is allow"))
//     }
// }


// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, 'images/')
//     },
//     filename: function (req, file, cb) {
//       cb(null, file.originalname)
//       // cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//     },  
//   });

const limits = {
    fileSize: 400000000
}

//fileFilter function controls which files should be uploaded. req = request being made. file = contains file info. cb = callback function to tell multer when we are done filtering the file. send back an error message to the client with cb.
const fileFilter = (req, file, cb) => {
    //if the file is not a jpg, jpeg, or png file, do not upload it multer; reject it.
    // if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    if (!file.originalname.match(/\.(mkv|mp4)$/)) {
        return cb(new Error('File must be of type JPG, JPEG, or PNG and nore more than 2MB in size'))
    }
    //undefined = nothing went wrong; true = that is true, nothing went wrong, accept the upload.
    cb(undefined, true)
}

//set up the multer middleware
const upload = multer({
    storage: storage,
    limits: limits,
    fileFilter: fileFilter
    // filename: filename
})


// const upload = multer({
//     storage: storage,
//     fileFilter : isImage
// });

// all user
router.get('/displayuser', async (req, res, next) => {
    try {
        var db = req.dbConnection;
        await db.query("select * from adduser", function (error, result) {
            if (error) {
                console.log(error)
            }
            else {
                res.status(200).json({
                    status: 1,
                    message: "succefuly ",
                    result: result
                })
            }
        })
    } catch (error) {
        res.status(404).json({
            message: "An error occured",
            error: error
        })
    }
});


// user registration api
router.post('/singUp', upload.single('image'), async (req, res, next) => {
    try {
        var db = req.dbConnection;
        var pass = req.body.password;
        var value = bcrypt.hashSync(pass, 10);
        var data = {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            password: value,
            image: req.file.filename
        }
        await db.query("INSERT into adduser set ?", [data], function (error, result, fields) {
            if (error) {
                res.status(500).json({
                    message: "An error",
                    error: error
                })
            }
            else {
                res.status(201).json({
                    message: "Succefully Registration User ",
                    result: result,
                    url: `http://localhost:2000/user/singUp/${req.file.filename}`
                })
            }
        })

    }
    catch (error) {
        res.send({
            message: "An error occured"
        })
    }
})


// user login api
router.post('/login', async (req, res, next) => {
    try {
        db = req.dbConnection;
        let email = req.body.email;
        var sql = `select * from adduser where email = ?`
        await db.query(sql, [email], function (error, result, fields) {
            if (error) {
                return res.status(500).json({
                    message: "error occured",
                    error: error
                })
            }
            else if (result.length > 0) {
                if (bcrypt.compare(req.body.password, result[0].password)) {
                    const token = jwt.sign({ loginAdmin: result }, '12345');
                    res.status(200).json({ message: 'login successfully.', token: token })
                }
                else {
                    res.status(500).json({
                        message: "password dose not match"
                    });
                }
            }
            else {
                res.status(404).json({ message: "email is not correct" });
            }
        })
    }
    catch (error) {
        res.status(500).json({
            message: "An error occured",
            error: error
        })
    }
})


// delete user 
router.delete('/delete/:id', verifyToken, async (req, res, next) => {
    try {
        var db = req.dbConnection;
        var id = req.params.id;
        await db.query(`DELETE FROM adduser WHERE id=?`, id, function (error, result, fields) {
            if (error) {
                res.status(500).json({
                    message: "An error",
                    error: error
                })
            }
            else {
                res.status(200).json({
                    message: "User Delete Succefully",
                    result: result
                })
            }
        })
    }
    catch (error) {
        res.status(500).json({
            message: "An error occured",
            error: error
        })
    }
})


// update user API
router.put('/update/:id', upload.single('image'), async (req, res, next) => {
    try {
        console.log(req.params.id)
        var db = req.dbConnection;
        var id = req.params.id;
        var firstname = req.body.firstname;
        var lastname = req.body.lastname;
        var email = req.body.email;
        var pass = req.body.password;
        var password = bcrypt.hashSync(pass, 10);
        var image = req.file.filename;
        var sql = "UPDATE adduser SET firstname=?, lastname=?,email=?,password=?,image=? where id=?";
        await db.query(sql, [firstname, lastname, email, password, image, id], function (error, result, fields) {
            if (error) {
                res.status(500).json({
                    message: "cannot update this user",
                    error: error
                })
            }
            else {
                res.status(200).json({
                    message: "user update successfully ",
                    result: result
                })
            }
        })
    }
    catch (error) {
        res.status(404).json({
            message: "An error occured",
            error: error
        })
    }
})


// search user 
router.get('/search/:key', async (req, res, next) => {
    try {
        db = req.dbConnection;
        var firstname = req.params.key;
        var lastname = req.params.key;
        var email = req.params.key;
        var sql = "select * from adduser where firstname LIKE '%" + firstname + "%' OR lastname LIKE '%" + lastname + "%' OR email LIKE '%" + email + "%'";
        await db.query(sql, function (error, result, fields) {
            if (error) {
                res.status(404).json({
                    message: "error ",
                    error: error
                })
            }
            else {
                res.status(200).json({
                    message: "search users",
                    result: result
                });
            }
        })
    }
    catch (error) {
        res.status(404).json({
            message: "An error occured cannot search user",
            error: error
        })
    }

})


// // admin registration;
// router.post('/adminsingUp', async (req, res, next) => {
//     try {
//         var db = req.dbConnection;
//         var pass = req.body.password;
//         var value = bcrypt.hashSync(pass, 10);
//         var data = {
//             name: req.body.name,
//             email: req.body.email,
//             password: value,
//             userType: req.body.userType
//         }
//         await db.query("INSERT into admin set ?", [data], function (error, result, fields) {
//             if (error) {
//                 res.status(500).json({
//                     message: "An error",
//                     error: error
//                 })
//             }
//             else {
//                 res.status(201).json({
//                     message: "Succefully Register Admin ",
//                     result: result,
//                 })
//             }
//         })

//     }
//     catch (error) {
//         res.send({
//             message: "An error occured"
//         })
//     }
// })



// // admin login
// router.post('/adminlogin', async (req, res, next) => {
//     try {
//         db = req.dbConnection;
//         let email = req.body.email;
//         var sql = `select * from admin where email = ?`
//         await db.query(sql, [email], function (error, result, fields) {
//             if (error) {
//                 return res.status(500).json({
//                     message: "error occured",
//                     error: error
//                 })
//             }
//             else if (result.length > 0) {
//                 if (bcrypt.compare(req.body.password, result[0].password)) {
//                     const token = jwt.sign({ loginAdmin: result }, '12345');
//                     res.status(200).json({ message: 'login successfully.', token: token })
//                 }
//                 else {
//                     res.status(500).json({
//                         message: "password dose not match"
//                     });
//                 }
//             }
//             else {
//                 res.status(404).json({ message: "email is not correct" });
//             }
//         })
//     }
//     catch (error) {
//         res.status(500).json({
//             message: "An error occured",
//             error: error
//         })
//     }
// })

module.exports = router;