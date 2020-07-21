// Rooms & Users
const { addUserToRoom, addMessageToRoom, removeUserFromRoom, getRoom, getUser } = require("./data/Rooms");

class SocketHandler{
    constructor(socket, io){
        this.socket = socket;
        this.io = io;

        // bindings
        this.startEventListeners = this.startEventListeners.bind(this);
        this.handleJoiningRoom = this.handleJoiningRoom.bind(this);
        this.handleDisconnecting = this.handleDisconnecting.bind(this);
        this.handleMessagesRequest = this.handleMessagesRequest.bind(this);
        this.handleMessageSent = this.handleMessageSent.bind(this);
    }

    startEventListeners(){
        // User joined the room
        this.socket.on("join_room", this.handleJoiningRoom);

        // Return messages to user
        this.socket.on("get_messages", this.handleMessagesRequest);
        this.socket.on("send_message", this.handleMessageSent);

        // Before leave
        this.socket.on("disconnecting", this.handleDisconnecting);
    }

    // When user joins the room
    handleJoiningRoom(data){
        const room = getRoom(data.room_code);
        if (room) {
            this.socket.room_code = data.room_code;
            this.socket.auth_user_id = data.user_id;
            // USER OBJECT
            const user = {
                id: data.user_id,
                username: data.username
            };
            addUserToRoom(this.socket.room_code, user);
            this.socket.join(this.socket.room_code);

            // Emit that the user has joined the room
            this.io.in(this.socket.room_code).emit("update_users", {
                message: `${data.username} has joined the room`,
                users: getRoom(this.socket.room_code).users
            });
        }
    }

    // Return list of messages to user
    handleMessagesRequest(fn){
        const room = getRoom(this.socket.room_code);
        if(room){
            fn(room.messages);
        }
        else{
            fn(undefined);
        }
    }

    // Message is sent to room
    handleMessageSent(data, fn){
        if(data.message.trim().length > 0){
            // MESSAGE OBJECT
            const msg = {
                user: getUser(this.socket.room_code, this.socket.auth_user_id),
                message: data.message,
                sent_at: new Date()
            };
            if(msg.user){
                const sent = addMessageToRoom(this.socket.room_code, msg);
                if (sent) {
                    this.io.in(this.socket.room_code).emit("message_received", msg);
                    fn({
                        success: true
                    });
                }
            }
            else{
                fn({ success: false });
            }
        }
        else{
            fn({ success: false });
        }
    }

    // WHen user disconnects
    handleDisconnecting(){
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