const express = require("express");
const router = express.Router();
const authHelper = require("./../helpers/AuthHelper");
const { body, validationResult } = require("express-validator");

const SocketHandler = require("./../socketHandler");

// Rooms & Users
const { roomExists, addRoom, getRoom } = require("./../data/Rooms");

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
                console.log("Rendering...");
                return res.render("room/room", data);
            }
        }
        else{
            req.flash("error", "Room does not exist");
            return res.redirect("/");
        }
    });

    // Create room instance (POST)
    router.post("/create", authHelper.isAuthenticated, (req, res) => {
        let room_code = "";
        while(room_code == "" || roomExists(room_code)){
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const charactersLength = characters.length;
            for (let i = 0; i < 8; i++) {
                room_code += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
        }

        // ROOM OBJECT
        addRoom({
            room_code: room_code,
            name: req.body.name,
            max_users: req.body.max_users,
            canvasSize: {
                w: 400,
                h: 400,
            },
            lines: [],
            users: {},
            messages: []
        });

        req.flash("success", "Welcome");
        return res.redirect(`/rooms/${room_code}`);
    });

    // Socket.io logic
    io.on("connection", socket => {
        const handler = new SocketHandler(socket, io);
        handler.startEventListeners();
    });

    return router;
}

module.exports = controller;