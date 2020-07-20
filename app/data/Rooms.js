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
        rooms[roomId].users.push(user);
    }
}

// Removes user from room
function removeUserFromRoom(roomId, userId){
    const room = rooms[roomId];
    if(room){
        let index = -1;
        for(let i = 0; i < room.users.length && index == -1; i++){
            if(room.users[i].id == userId){
                index = i;
            }
        }

        rooms[roomId].users.splice(index, 1);
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

// Returns list of all rooms - mostly for debugging
function getRooms(){
    return rooms;
}

module.exports = {
    roomExists,
    addRoom,
    addUserToRoom,
    removeUserFromRoom,
    getUsersFromRoom,
    getRoom,
    getRooms
}