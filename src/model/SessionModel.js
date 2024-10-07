const mongoose = require("mongoose");
const { Schema } = mongoose;

const sessionSchema = new Schema({
    academicYear: {
        type: String,
        required: true,
      },
      semester: {
        type: Number,
        required: true,
      },
      times: {
        type: [String],
        required: true,
      },
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;