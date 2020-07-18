const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    }
});

UserSchema.methods.verifyPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model("User", UserSchema);