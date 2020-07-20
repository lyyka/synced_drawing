let rooms = [];

// Checks if the given room exists
function roomExists(roomId){
    return rooms[roomId] != undefined;
}

// Adds new room to array
function addRoom(room){
    rooms[room.room_code] = room;
}

// Adds new user to room
function addUserToRoom(roomId, user){
    const room = rooms[roomId];
    if(room){
        rooms[roomId].users[user.id] = user;
    }
}

// Removes user from room
function removeUserFromRoom(roomId, userId){
    if (rooms[roomId] && rooms[roomId].users[userId]){
        const user = rooms[roomId].users[userId];
        delete rooms[roomId].users[userId];
        return user;
    }
    else{
        return undefined;
    }
}

// Get all users in a room
function getUsersFromRoom(roomId){
    const room = rooms[roomId];
    if(room){
        return room.users;
    }
    else{
        return undefined;
    }
}

// Gets specific rooms
function getRoom(roomId) {
    return rooms[roomId];
}

module.exports = {
    roomExists,
    addRoom,
    addUserToRoom,
    removeUserFromRoom,
    getUsersFromRoom,
    getRoom
}