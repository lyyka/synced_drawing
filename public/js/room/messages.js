$(document).ready(onReady);

// When document is loaded
function onReady(e) {

    // DOM Events
    $("#send-msg-btn").click(sendMessageEvent);
    $("#message").on("keypress", function (e) {
        if (e.which == 13) {
            sendMessageEvent(e);
        }
    });

    // Show options for chat
    $("#show-msgs-opts").click(showMessageOpts);
}

// Show options for messages
function showMessageOpts(e) {
    const opts = $("#msgs-opts");
    if (opts.hasClass("d-none")) {
        opts.removeClass("d-none");
        opts.addClass("d-block");
    }
    else {
        opts.removeClass("d-block");
        opts.addClass("d-none");
    }
}

// Sends the message
function sendMessageEvent(e) {
    const msg = $("#message").val();
    if (msg.trim().length > 0) {
        sendMessage(msg, (data) => {
            if (data.success) {
                $("#message").val("");
            }
        })
    }
}