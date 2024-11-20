const mongoose = require("mongoose");
const {Schema} = mongoose;

const ResourceSchema = new Schema({
    location: {
        type: String,
    },
    acs: {
        type: String,
    },
    chairs: {
        type: String,
    },
    benches: {
        type: String,
    },
    computers: {
        type: String,
    },
    fans: {
        type: String,
    },
    tubelights: {
        type: String,
    },
    projectors: {
        type: String,
    },
    academicYear: {
        type: String
    },
    semester: {
        type: String
    }
});

const Resource = mongoose.model('Resource', ResourceSchema);

module.exports = Resource