const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true,
    },
    pais: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true,
    },
    create: {
        type: Date,
        required: true,
        default: Date.now,
    },
});
module.exports = mongoose.model("User", userSchema);