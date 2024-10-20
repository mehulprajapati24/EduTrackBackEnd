const mongoose = require("mongoose");
const { Schema } = mongoose;

const sessionSchema = new Schema({
  type: {
    type: String,
  },
  time: {
    type: String,
  },
  subject: {
    type: String,
  },
  classbatch: {
    type: String,
  },
  faculty: {
    type: String,
  },
  location: {
    type: String,
  }
});

const SpreadSheetTimeTableSchema = new Schema({
  class: {
    type: String, // E.g., "7CE-C"
  },
  weeklyTimetable: {
    Monday: [[sessionSchema]],
    Tuesday: [[sessionSchema]],
    Wednesday: [[sessionSchema]],
    Thursday: [[sessionSchema]],
    Friday: [[sessionSchema]],
    Saturday: [[sessionSchema]],
  }
});

const SpreadSheetTimeTable = mongoose.model('SpreadSheetTimeTable', SpreadSheetTimeTableSchema);
module.exports = SpreadSheetTimeTable;
