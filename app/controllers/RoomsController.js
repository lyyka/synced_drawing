const express = require("express");
const router = express.Router();
const authHelper = require("./../helpers/AuthHelper");

// Join the room
// router.get("/:id", authHelper.isAuthenticated, (req, res) => {
//     // TODO: Show room
// });

// Create room (GET) - Just shows the form
router.get("/create", authHelper.isAuthenticated, (req, res) => {
    res.render("room/create", {
        title: "Create a room",
        oldInput: req.oldInput
    });
});

// Create room instance (POST)
router.post("/", authHelper.isAuthenticated, (req, res) => {
    // TODO: Create new room
});

module.exports = router;