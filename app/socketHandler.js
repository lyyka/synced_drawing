// Rooms & Users
const {
    addUserToRoom,
    addMessageToRoom,
    updateCanvas,
    appendObjectToDrawing,
    undo,
    clearCanvas,
    removeUserFromRoom,
    getRoom,
    getUser,
} = require("./data/Rooms");

class SocketHandler {
    constructor(socket, io) {
        this.socket = socket;
        this.io = io;

        // bindings
        this.startEventListeners = this.startEventListeners.bind(this);
        this.handleJoiningRoom = this.handleJoiningRoom.bind(this);
        this.handleFinalJoin = this.handleFinalJoin.bind(this);
        this.handleDisconnecting = this.handleDisconnecting.bind(this);
        this.handleMessageSent = this.handleMessageSent.bind(this);
        this.handleCanvasSizeChange = this.handleCanvasSizeChange.bind(this);
        this.handleNewObject = this.handleNewObject.bind(this);
        this.handleUndo = this.handleUndo.bind(this);
        this.handleClearCanvas = this.handleClearCanvas.bind(this);
        this.handleGetDrawing = this.handleGetDrawing.bind(this);
    }

    startEventListeners() {
        // User joined the room
        this.socket.on("join_room", this.handleJoiningRoom);
        this.socket.on("finalize_join", this.handleFinalJoin);

        // Return messages to user
        this.socket.on("send_message", this.handleMessageSent);

        // Drawing
        this.socket.on("sync_canvas_size", this.handleCanvasSizeChange);
        this.socket.on("sync_new_object", this.handleNewObject);
        this.socket.on("sync_clear_canvas", this.handleClearCanvas);
        this.socket.on("get_drawing", this.handleGetDrawing);
        this.socket.on("undo_user_action", this.handleUndo);

        // Before leave
        this.socket.on("disconnecting", this.handleDisconnecting);
    }

    // When user joins the room
    handleJoiningRoom(data, callback) {
        const room = getRoom(data.room_code);
        if (room) {
            const getRandomColor = () => {
                const letters = '0123456789ABCDEF';
                let color = '#';
                for (var i = 0; i < 6; i++) {
                    color += letters[Math.floor(Math.random() * 16)];
                }
                return color;
            };

            this.socket.room_code = data.room_code;
            this.socket.auth_user_id = data.user_id;
            // USER OBJECT
            const user = {
                id: data.user_id,
                username: data.username,
                color: getRandomColor(),
                size: 20
            };
            addUserToRoom(this.socket.room_code, user);
            this.socket.join(this.socket.room_code);

            // Emit that the user has joined the room
            callback(user, room.messages);
        } else {
            callback(undefined, undefined);
        }
    }

    // When user joins the room
    handleFinalJoin(data) {
        // Emit that the user has joined the room
        this.io.in(this.socket.room_code).emit("update_users", {
            message: `${data.username} has joined the room`,
            users: getRoom(this.socket.room_code).users
        });
    }

    // Message is sent to room
    handleMessageSent(data, fn) {
        if (data.message.trim().length > 0) {
            // MESSAGE OBJECT
            const msg = {
                user: getUser(this.socket.room_code, this.socket.auth_user_id),
                message: data.message,
                sent_at: new Date()
            };
            if (msg.user) {
                const sent = addMessageToRoom(this.socket.room_code, msg);
                if (sent) {
                    this.io.in(this.socket.room_code).emit("message_received", msg);
                    fn({
                        success: true
                    });
                }
            } else {
                fn({
                    success: false
                });
            }
        } else {
            fn({
                success: false
            });
        }
    }

    // Handle canvas size change
    handleCanvasSizeChange(size) {
        const updated = updateCanvas(this.socket.room_code, size);
        if (updated) {
            this.io.in(this.socket.room_code).emit("update_canvas_size", size);
        }
    }

    // Handle mouse drag
    handleNewObject(obj) {
        const user = getUser(this.socket.room_code, this.socket.auth_user_id);
        const room = getRoom(this.socket.room_code);
        if (user) {
            // Validate if points for lines are still inside canvas
            let points_valid = true;
            if (obj.type == "line") {
                // obj.points.forEach(point => {
                //     points_valid = point.x >= 0 && point.x <= room.canvasSize.w && point.y >= 0 && point.y <= room.canvasSize.h;
                // });
                points_valid = obj.x >= 0 && obj.x <= room.canvasSize.w && obj.y >= 0 && obj.y <= room.canvasSize.h;
            }

            if (points_valid) {
                obj.user_id = this.socket.auth_user_id;
                appendObjectToDrawing(obj, this.socket.room_code);
                this.io.in(this.socket.room_code).emit("object_received", obj);
            }
        }
    }

    // Clears the canvas
    handleClearCanvas(callback) {
        clearCanvas(this.socket.room_code);
        this.io.in(this.socket.room_code).emit("clear_canvas");
        callback();
    }

    // Returns whole drawing to user
    handleGetDrawing(callback) {
        const room = getRoom(this.socket.room_code);
        if (room) {
            callback(room.drawing);
        } else {
            callback(undefined);
        }
    }

    // Undo action - remove last object user placed
    handleUndo(callback) {
        let done = undo(this.socket.room_code, this.socket.auth_user_id);
        if(done){
            const room = getRoom(this.socket.room_code);
            if (room) {
                callback(room.drawing);
            } else {
                callback(undefined);
            }
        }
    }

    // When user disconnects
    handleDisconnecting() {
        Object.keys(this.socket.rooms).forEach(key => {
            const user = removeUserFromRoom(key, this.socket.auth_user_id);
            if (user) {
                // Emit that the user has left the room
                this.io.in(key).emit("update_users", {
                    message: `${user.username} has left the room`,
                    users: getRoom(key).users
                });
            }
        });
    }
}

module.exports = SocketHandler;