const mongoose = require("mongoose");
const {Schema} = mongoose;

const FacultySchema = new Schema({
    enrollment: {
        type: String,
    },
    name: {
        type: String,
    },
    branch: {
        type: String,
    },
    phone: {
        type: String,
    },
    gnuemail: {
        type: String,
    },
    password: {
        type: String,
    }
});

const Faculty = mongoose.model('Faculty', FacultySchema);

module.exports = Faculty