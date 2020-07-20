const express = require("express");
const router = express.Router();
const authHelper = require("./../helpers/AuthHelper");

// Rooms & Users
const { roomExists, addRoom, addUserToRoom, removeUserFromRoom, getUsersFromRoom, getRoom, getRooms } = require("./../data/Rooms");

const controller = (io) => {
    // Create room (GET) - Just shows the form
    router.get("/create", authHelper.isAuthenticated, (req, res) => {
        res.render("room/create", {
            title: "Create a room",
            oldInput: req.oldInput
        });
    });

    // Join the room
    router.get("/:id", authHelper.isAuthenticated, (req, res) => {
        const room = getRoom(req.params.id);
        if(room){
            if(room.users.length == room.max_users){
                req.flash("error", "Room is full right now");
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

        addRoom({
            room_code: room_code,
            name: req.body.name,
            max_users: req.body.max_users,
            users: []
        });

        req.flash("success", "Welcome");
        return res.redirect(`/rooms/${room_code}`);
    });

    // Socket.io logic
    io.on("connection", socket => {
        console.log(`New connection to room, sid: ${socket.id}`);
        // User joined the room
        socket.on("join_room", data => {
            addUserToRoom(data.room_code, {
                id: socket.id,
                username: data.username
            });
            console.log(getUsersFromRoom(data.room_code));
            socket.join(data.room_code);
        });

        // Before leave
        socket.on("disconnecting", () => {
            Object.keys(socket.rooms).forEach(key => {
                removeUserFromRoom(key, socket.id);
            });
        });
    });

    return router;
}

module.exports = controller;