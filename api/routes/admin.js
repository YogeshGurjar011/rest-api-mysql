const express = require("express");
const router = express.Router();
// const multer = require("multer");
// const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");



// admins
router.get('/displayadmin', async (req, res, next) => {
    try {
        var db = req.dbConnection;
        await db.query("select * from admin", function (error, result) {
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

// admin registration;
router.post('/adminsingUp', async (req, res, next) => {
    try {
        var db = req.dbConnection;
        var pass = req.body.password;
        var value = bcrypt.hashSync(pass, 10);
        var data = {
            name: req.body.name,
            email: req.body.email,
            password: value,
            userType: req.body.userType
        }
        await db.query("INSERT into admin set ?", [data], function (error, result, fields) {
            if (error) {
                res.status(500).json({
                    message: "An error",
                    error: error
                })
            }
            else {
                res.status(201).json({
                    message: "Succefully Register Admin ",
                    result: result,
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



// admin login
router.post('/adminlogin', async (req, res, next) => {
    try {
        db = req.dbConnection;
        let email = req.body.email;
        var sql = `select * from admin where email = ?`
        await db.query(sql, [email], function (error, result, fields) {
            if (error) {
                return res.status(500).json({
                    message: "error occured",
                    error: error
                })
            }
            else if (result.length > 0) {
                if (bcrypt.compare(req.body.password, result[0].password)) {
                    const token = jwt.sign({ loginAdmin: result }, 'thisissecretkey', { expiresIn: "365d" });
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

module.exports = router;