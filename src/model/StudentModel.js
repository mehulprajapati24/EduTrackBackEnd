const mongoose = require("mongoose");
const {Schema} = mongoose;

const StudentSchema = new Schema({
    enrollment: {
        type: String,
    },
    name: {
        type: String,
    },
    branch: {
        type: String,
    },
    hostellercommuter: {
        type: String,
    },
    semester: {
        type: String,
    },
    phone: {
        type: String,
    },
    parentsphone: {
        type: String,
    },
    gnuemail: {
        type: String,
    },
    email: {
        type: String,
    },
    batch: {
        type: String,
    },
    class: {
        type: String,
    },
    password: {
        type: String,
    },
    profileLink: {
        type: String
    },
    academicYear: {
        type: String
    },
    sem: {
        type: String
    }
});

const Student = mongoose.model('Student', StudentSchema);

module.exports = Student