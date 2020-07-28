const express = require("express");
const router = express.Router();
const {
    body,
    validationResult
} = require("express-validator");
const authHelper = require("./../helpers/AuthHelper");
const bcrypt = require("bcrypt");
const passport = require("passport");

// Models
const User = require("./../../models/User");

// Log out
router.get("/logout", authHelper.isAuthenticated, (req, res) => {
    req.logout();
    if (req.query.redirectTo) {
        return res.redirect(req.query.redirectTo);
    } else {
        return res.redirect("/");
    }
});

// Log in
router.get("/login", authHelper.isNotAuthenticated, (req, res) => {
    res.render("auth/login", {
        title: "Log in",
        oldInput: req.oldInput
    });
});

router.post("/login", authHelper.isNotAuthenticated, (req, res, next) => {
    passport.authenticate("local", (err, user) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash("error", "Wrong username or password");
            return res.redirect('/auth/login');
        }

        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }

            req.flash("success", `Welcome, ${user.username}`);
            return res.redirect("/users/dashboard");
        });
    })(req, res, next);
});

// Register
router.get("/register", authHelper.isNotAuthenticated, (req, res) => {
    res.render("auth/register", {
        title: "Register",
        oldInput: req.oldInput
    });
});

router.post("/register", [
    body("name").notEmpty().withMessage("Name can not be empty")
    .trim().escape(),
    body("email").notEmpty().withMessage("Email can not be empty")
    .isEmail().withMessage("Email must be valid email string")
    .normalizeEmail(),
    body("username").notEmpty().withMessage("Username can not be empty")
    .trim().escape().
    isLength({
        max: 16
    }).withMessage("Username must be less than 16 chars long"),
    body("password").notEmpty().withMessage("Password can not be empty")
    .trim().isLength({
        min: 8
    }).withMessage("Password must be min. 8 chars long")
], authHelper.isNotAuthenticated, (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
        req.flash("inputErrors", errs.array({
            onlyFirstError: true
        }));
        return res.redirect("/auth/register");
    } else {
        const passHash = bcrypt.hashSync(req.body.password, 10);
        User.create({
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            password: passHash
        }).then((user) => {
            req.flash("success", "Account created successfully, you can now log in");
            res.redirect("/auth/login");
        }).catch((err) => {
            if (err.code == 11000) {
                req.flash("inputErrors", [{
                    param: "email",
                    msg: "That email is already in use"
                }]);
            } else {
                req.flash("error", "Error occurred. Please try again later");
            }
            return res.redirect("/auth/register");
        });
    }
});

// Password update
router.put("/password", [
    body("current_password").notEmpty().withMessage("Current password can not be empty"),
    body("new_password").notEmpty().withMessage("New password can not be empty")
    .isLength({
        min: 8
    }).withMessage("New password must be min. 8 chars long")
    .custom((value, {
        req,
        loc,
        path
    }) => {
        if (value !== req.body.confirm_new_password) {
            // trow error if passwords do not match
            throw new Error("Passwords don't match");
        } else {
            return value;
        }
    })

], authHelper.isAuthenticated, (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
        req.flash("inputErrors", errs.array({
            onlyFirstError: true
        }));
        return res.redirect("back");
    } else {
        User.findById(req.user.id, (err, user) => {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            } else if (user) {
                if (user.verifyPassword(req.body.current_password)) {
                    user.password = bcrypt.hashSync(req.body.new_password, 10);
                    user.save();
                    req.logout();
                    req.flash("success", "Password updated. Please log in again");
                    return res.redirect("/auth/login");
                } else {
                    req.flash("inputErrors", [{
                        param: "current_password",
                        msg: "Current password does not match"
                    }])
                    return res.redirect("back");
                }
            } else {
                req.flash("error", "User can not be found");
                return res.redirect("back");
            }
        });
    }
});

module.exports = router;