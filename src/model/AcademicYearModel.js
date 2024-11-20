const mongoose = require("mongoose");
const {Schema} = mongoose;

const AcademicSchema = new Schema({
    academicYear: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: true
        },
    selected: {
        type: Boolean,
        default: false
    }
});

const AcademicYear = mongoose.model('AcademicYear', AcademicSchema);

module.exports = AcademicYear