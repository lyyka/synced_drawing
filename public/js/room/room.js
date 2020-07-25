$(document).ready(onReady);

// When document is loaded
function onReady(e){
    // Generate QR Code
    const qrcode = new QRCode("qrcode", {
        text: room_code,
        width: 90,
        height: 90,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    // Socket events/emits
    joinRoom();

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

    // Update canvas size inputs
    $("#canvas_w").on("change", updateCanvasSizeEvent);
    $("#canvas_h").on("change", updateCanvasSizeEvent);
}

function updateCanvasSizeEvent(e){
    const size = {
        w: $("#canvas_w").val(),
        h: $("#canvas_h").val()
    };
    if (size.w >= 100 && size.w <= 10000 && size.h >= 100 && size.h <= 10000){
        syncCanvasSize(size);
    }
}