const socket = io();

$(document).ready(onReady);

function onReady(e){
    socket.emit("join_room", {
        username: username,
        room_code: room_code
    });
}