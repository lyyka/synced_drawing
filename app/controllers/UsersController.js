const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const authHelper = require("./../helpers/AuthHelper");

// Models
const User = require("./../../models/User");

// Dashboard
router.get("/dashboard", authHelper.isAuthenticated, (req, res) => {
    res.render("users/dashboard", {
        title: "Dashboard",
    });
});

// Update user info
router.put("/", [
    body("name").notEmpty().withMessage("Name can not be empty")
        .trim().escape(),
    body("email").notEmpty().withMessage("Email can not be empty")
        .isEmail().withMessage("Email must be valid email string")
        .normalizeEmail(),
    body("username").notEmpty().withMessage("Username can not be empty")
        .trim().escape().
        isLength({ max: 16 }).withMessage("Username must be less than 16 chars long")
], authHelper.isAuthenticated, (req, res) => {
    const errs = validationResult(req);
    if(!errs.isEmpty()){
        req.flash("inputErrors", errs.array({ onlyFirstError: true }));
        return res.redirect("back");
    }
    else{
        User.findById(req.user.id, (err, user) => {
            if(err){
                req.flash("error", "Error occurred. Please try again later");
            }
            else if(user){
                user.name = req.body.name;
                user.email = req.body.email;
                user.username = req.body.username;
                user.save();

                req.flash("success", "Account updated");
            }
            else{
                req.flash("success", "User can not be found");
            }
            return res.redirect("back");
        });
    }
});

// Delete current user
router.delete("/", authHelper.isAuthenticated, (req, res) => {
    User.deleteOne({ _id: req.user.id }, (err) => {
        if (err) {
            req.flash("error", "Error occurred. Please try again later");
            return res.redirect("back");
        }
        else{
            req.logout();
            req.flash("success", "Account removed");
            return res.redirect("/");
        }
    });
});

module.exports = router;