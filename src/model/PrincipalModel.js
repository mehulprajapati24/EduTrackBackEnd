const mongoose = require("mongoose");
const {Schema} = mongoose;

const PrincipalSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
        }
});

const Principal = mongoose.model('Principal', PrincipalSchema);

module.exports = Principal