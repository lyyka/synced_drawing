const express = require("express");
const router = express.Router();
const authHelper = require("./../helpers/AuthHelper");
const { body, validationResult } = require("express-validator");

// Rooms & Users
const { roomExists, addRoom, addUserToRoom, removeUserFromRoom, getUsersFromRoom, getRoom } = require("./../data/Rooms");

const controller = (io) => {
    // Create room (GET) - Just shows the form
    router.get("/create", authHelper.isAuthenticated, (req, res) => {
        res.render("room/create", {
            title: "Create a room",
            oldInput: req.oldInput
        });
    });

    // Renders join room form
    router.get("/join", authHelper.isAuthenticated, (req, res) => {
        res.render("room/join", {
            title: "Join a room",
            oldInput: req.oldInput
        });
    });

    // Join room form submission. Just redirects to /:id
    router.post("/join", [
        body("room_code").trim().escape().notEmpty().isAlphanumeric().withMessage("Room code is not properly formatted")
    ], authHelper.isAuthenticated, (req, res) => {
        const errs = validationResult(req);
        if(!errs.isEmpty()){
            req.flash("inputErrors", errs.array({
                onlyFirstError: true
            }));
            return res.redirect("back");
        }
        else{
            return res.redirect(`/rooms/${req.body.room_code.toUpperCase()}`);
        }
    });

    // Join the room with ID
    router.get("/:id", authHelper.isAuthenticated, (req, res) => {
        const room = getRoom(req.params.id);
        if(room){
            if(room.users.length == room.max_users){
                req.flash("error", "Room is full right now. Try again later");
                return res.redirect("/");
            }
            else{
                const data = {
                    room: room,
                    title: room.name
                };
                return res.render("room/room", data);
            }
        }
        else{
            req.flash("error", "Room does not exist");
            return res.redirect("/");
        }
    });

    // Create room instance (POST)
    router.post("/", authHelper.isAuthenticated, (req, res) => {
        let room_code = "";
        while(room_code == "" || roomExists(room_code)){
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const charactersLength = characters.length;
            for (let i = 0; i < 8; i++) {
                room_code += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
        }

        // CREATES NEW ROOM
        addRoom({
            room_code: room_code,
            name: req.body.name,
            max_users: req.body.max_users,
            users: {}
        });

        req.flash("success", "Welcome");
        return res.redirect(`/rooms/${room_code}`);
    });

    // Socket.io logic
    io.on("connection", socket => {
        // User joined the room
        socket.on("join_room", data => {
            // ADDS USER TO ROOM
            const user = {
                id: socket.id,
                username: data.username
            };
            addUserToRoom(data.room_code, user);
            // TODO: Emit that the user joined the room
            socket.join(data.room_code);
        });

        // Before leave
        socket.on("disconnecting", () => {
            Object.keys(socket.rooms).forEach(key => {
                const user = removeUserFromRoom(key, socket.id);
                if (user) {
                    // TODO: Emit that the user has left the room
                }
            });
        });
    });

    return router;
}

module.exports = controller;