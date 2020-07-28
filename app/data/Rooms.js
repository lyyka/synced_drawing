// Rooms is cached value
// Only on first require() of this model, rooms will be set to empty array.
// NodeJS automatically caches modules, so each time we require this module, it will return reference to the first object that is now cached. It will NOT create new copies of the module.
// That's why rooms are not cleared when we require this module in RoomsController and socketHandler.
let rooms = [];

// Checks if the given room exists
function roomExists(roomId) {
    return rooms[roomId] != undefined;
}

// Adds new room to array
function addRoom(room) {
    rooms[room.room_code] = room;
}

// Adds new user to room
function addUserToRoom(roomId, user) {
    const room = rooms[roomId];
    if (room) {
        rooms[roomId].users[user.id] = user;
    }
}

// Add message to room
function addMessageToRoom(roomId, message) {
    const room = rooms[roomId];
    if (room) {
        room.messages.push(message);
        return true;
    } else {
        return false;
    }
}

// Update room's canvas size
function updateCanvas(roomId, size) {
    let updated = false;
    if (rooms[roomId] && size.w && size.h && Object.keys(size).length == 2 && size.w >= 100 && size.w <= 10000 && size.h >= 100 && size.h <= 10000) {
        rooms[roomId].canvasSize = size;
        updated = true;
    }
    return updated;
}

// Update room's lines
function appendObjectToDrawing(obj, roomId) {
    if (rooms[roomId]) {
        rooms[roomId].drawing.push(obj);
    }
}

// Clear canvas
function clearCanvas(roomId) {
    if (rooms[roomId]) {
        rooms[roomId].drawing = [];
    }
}

// Removes user from room
function removeUserFromRoom(roomId, userId) {
    if (rooms[roomId] && rooms[roomId].users[userId]) {
        const user = rooms[roomId].users[userId];
        delete rooms[roomId].users[userId];
        return user;
    } else {
        return undefined;
    }
}

// Gets specific rooms
function getRoom(roomId) {
    return rooms[roomId];
}

// Gets user
function getUser(roomId, userId) {
    const room = rooms[roomId];
    if (room) {
        return room.users[userId];
    } else {
        return undefined;
    }
}

module.exports = {
    roomExists,
    addRoom,
    addUserToRoom,
    addMessageToRoom,
    updateCanvas,
    appendObjectToDrawing,
    clearCanvas,
    removeUserFromRoom,
    getRoom,
    getUser
}