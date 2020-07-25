const socket = io();
let user = undefined;
const scrollingBreakpoint = 750; // Limit over which chat will not scroll down on new message received

// Handle when user joins the room
// Join the room on server and get all msgs
function joinRoom(){
    // Emit that we joined the room
    const data = {
        user_id: user_id,
        username: username,
        room_code: room_code
    };
    socket.emit("join_room", data, (usr, messages) => {
        if(usr){
            // Get user object
            user = usr;

            // Set color and brush size
            $("#user_color").val(user.color);
            $("#brush_size").val(user.brushSize);

            // Update user color
            $("#user_color").on("change", (e) => {
                const color = $(e.target).val();
                user.color = color;
            });

            // Update brush size
            $("#brush_size").on("change", (e) => {
                const size = $(e.target).val();
                if (size >= 1 && size <= 50) {
                    user.brushSize = size;
                }
            });

            // Load messages
            updateMessages(messages);

            // Start event listeners
            setEventListeners();

            // This will update users only when we have set event listeners
            // and have the user object
            socket.emit("finalize_join", {
                username: data.username
            });

            // Get whole drawing
            setLoading();
            socket.emit("get_lines", loadLines);
        }
    });
}

// Listen for incoming events
function setEventListeners(){
    socket.on("update_users", userJoinedOrLeft);
    socket.on("message_received", addMessageToWrap);
    socket.on("update_canvas_size", updateCanvasSize);
}

// When user joins/leaves the room
function userJoinedOrLeft(data){
    // Update users list and users count
    updateUsers(data.users)

    // Show message
    notif.info(data.message);
}

// Populates the users list
function updateUsers(users) {
    const usrsList = $("#users-list");
    usrsList.empty();
    $("#number-of-participants").text(`${Object.keys(users).length} `);
    Object.keys(users).forEach(key => {
        const txt = $("<p></p>");
        txt.addClass("mb-2");
        txt.text(`${users[key].username} ${users[key].id == user.id ? "(You)" : ""}`);
        usrsList.append(txt);
    });
}

// Sends the message
function sendMessage(message, callback){
    socket.emit("send_message", {
        message: message
    }, callback);
}

// Populates messages list
function updateMessages(messages) {
    if (messages) {
        if (messages.length > 0) {
            messages.forEach(msg => {
                addMessageToWrap(msg, true);
            });
        }
        else {
            const list = $("#messages-list");
            // Empty messages
            const wrap = $("<div></div>");
            wrap.addClass("text-center");
            wrap.attr("id", "no-msgs-img");
            // Image
            const img = $("<img />");
            img.attr("src", "/images/mailbox.png");
            img.addClass("img-fluid");
            // Text msg
            const msg = $("<h5></h5>");
            msg.addClass("mb-0");
            msg.text("No messages");
            // Append
            wrap.append(img);
            wrap.append(msg);
            list.append(wrap);
        }
    }
    else {
        notif.alert("Error retreiving messages");
    }
}

// Add one msg bubble to chat
function addMessageToWrap(message, ignoreScrollingBreakpoint = false){
    // Remove img for no msgs if any
    const list = $("#messages-list");
    list.find("#no-msgs-img").remove();

    // wrap = sender + bubble
    const wrap = $("<div></div>");
    wrap.addClass("my-2 msg-wrap");
    // Sender text
    const sender = $("<span></span>");
    if (message.user.id == user.id) {
        wrap.addClass("text-right");
        sender.text("Me");
        sender.addClass("text-emerald");
    }
    else {
        sender.text(message.user.username);
    }
    // Bubble
    const bubble = $("<span></span>");
    bubble.addClass("d-inline-block px-2 py-1 msg-bubble rounded shadow-sm border");
    bubble.text(message.message);

    wrap.append(sender);
    wrap.append("<br />");
    wrap.append(bubble);

    list.append(wrap);
    if(list[0].scrollHeight - list.scrollTop() < scrollingBreakpoint || ignoreScrollingBreakpoint){
        list.scrollTop(list[0].scrollHeight);
    }
}

// Update canvas size
function syncCanvasSize(size){
    socket.emit("sync_canvas_size", size);
}
// -- Callback from server
function updateCanvasSize(size){
    $("#canvas").width(size.w);
    $("#canvas").height(size.h);
    $("#canvas_w").val(size.w);
    $("#canvas_h").val(size.h);
    resizeCanvas(size.w, size.h);
    setLoading();
    socket.emit("get_lines", loadLines);
}

// Mouse drag
function syncMouseDragCoordinates(coords) {
    socket.emit("sync_mouse_drag", coords);
}

// Clear canvas for everybody
function syncClearCanvas(){
    socket.emit("sync_clear_canvas", () => {
        $("#status").text("Ready!");
    });
}