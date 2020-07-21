const notif = new AWN({
    maxNotifications: 3,
    animationDuration: 200,
    durations: {
        global: 1800
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

    // Socket events/emits
    setEventListeners();
    joinRoom();

    // DOM Events
    $("#send-msg-btn").click(sendMessageEvent);
    $("#message").on("keypress", function(e){
        if(e.which == 13){
            sendMessageEvent(e);
        }
    });

    // Copy room code
    $("#room-code-text").click((e) => {
        const copyf = new CopyFunc();
        copyf.copy(room_code, () => {
            $("#room-code-text").text("Copied");
            window.setTimeout(function () {
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
function sendMessageEvent(e){
    const msg = $("#message").val();
    if(msg.trim().length > 0){
        sendMessage(msg, (data) => {
            if (data.success) {
                $("#message").val("");
            }
        })
    }
}