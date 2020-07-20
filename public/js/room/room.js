const socket = io();
const notif = new AWN({
    maxNotifications: 3,
    animationDuration: 200,
    durations: {
        global: 1800
    },
    icons: {
        // enabled: false
    }
});

$(document).ready(onReady);

// When document is loaded
function onReady(e){
    // Generate QR Code
    const qrcode = new QRCode("qrcode", {
        // text: `${document.location.origin}/rooms/${room_code}`,
        text: room_code,
        width: 90,
        height: 90,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    // Emit that we joined the room
    socket.emit("join_room", {
        user_id: user_id,
        username: username,
        room_code: room_code
    });

    // Get all current messages
    // Rest of messages will update while user is on page
    socket.emit("get_messages", updateMessages);

    // Listeners - events
    socket.on("update_users", userJoinedOrLeft);
    socket.on("message_received", addMessageToWrap);

    // DOM Events
    $("#send-msg-btn").click(sendMessage);
    $("#message").on("keypress", function(e){
        if(e.which == 13){
            sendMessage(e);
        }
    });

    // Copy room code to clipboard
    const fallback = (text) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // Avoid scrolling to bottom
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
        } catch (err) {
            console.error('Error copying text');
        }

        document.body.removeChild(textArea);
    }
    $("#room-code-text").click((e) => {
        if (!navigator.clipboard) {
            fallback(room_code);
            return;
        }
        navigator.clipboard.writeText(room_code).then(function () {
            $("#room-code-text").text("Copied");
            window.setTimeout(function() {
                $("#room-code-text").text(`#${room_code}`);
            }, 1000);
        });
    });

    // Show options for chat
    $("#show-msgs-opts").click(showMessageOpts);
}

// Show options for messages
function showMessageOpts(e){
    const opts = $("#msgs-opts");
    if(opts.hasClass("d-none")){
        opts.removeClass("d-none");
        opts.addClass("d-block");
    }
    else{
        opts.removeClass("d-block");
        opts.addClass("d-none");
    }
}

// Sends the message
function sendMessage(e){
    const msg = $("#message").val();
    if(msg.trim().length > 0){
        $("#message").val("");
        socket.emit("send_message", {
            message: msg
        }, (data) => {
            if(data.success){
                const list = $("#messages-list");
                list.scrollTop(list[0].scrollHeight);
            }
        });
    }
}

// Is called by server whenever someone joins the room
function userJoinedOrLeft(data) {
    // Update users list and users count
    updateUsers(data.users)

    // Show message
    notif.info(data.message);
}

// Populates the users list
function updateUsers(users){
    const usrsList = $("#users-list");
    usrsList.empty();
    $("#number-of-participants").text(`${Object.keys(users).length} `);
    Object.keys(users).forEach(key => {
        const txt = $("<p></p>");
        txt.addClass("mb-2");
        txt.text(users[key].username);
        usrsList.append(txt);
    });
}

// Populates messages list
function updateMessages(messages){
    if(messages){
        if(messages.length > 0){
            messages.forEach(msg => {
                addMessageToWrap(msg);
            });
        }
        else{
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
    else{
        notif.alert("Error retreiving messages");
    }
}

function addMessageToWrap(message){
    const list = $("#messages-list");
    list.find("#no-msgs-img").remove();
    const wrap = $("<div></div>");
    wrap.addClass("my-2 msg-wrap");
    // wrap = sender + bubble
    const sender = $("<span></span>");
    if (message.user.id == user_id) {
        wrap.addClass("text-right");
        sender.text("Me");
        sender.addClass("text-emerald");
    }
    else{
        sender.text(message.user.username);
    }
    const bubble = $("<span></span>");
    bubble.addClass("d-inline-block px-2 py-1 msg-bubble rounded shadow-sm border");
    bubble.text(message.message);

    wrap.append(sender);
    wrap.append("<br />");
    wrap.append(bubble);

    list.append(wrap);
}