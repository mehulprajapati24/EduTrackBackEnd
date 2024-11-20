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

const SpreadSheetFacultyTimeTableSchema = new Schema({
  facultyName: {
    type: String, // E.g., "HMS"
  },
  weeklyTimetable: {
    Monday: [[sessionSchema]],
    Tuesday: [[sessionSchema]],
    Wednesday: [[sessionSchema]],
    Thursday: [[sessionSchema]],
    Friday: [[sessionSchema]],
    Saturday: [[sessionSchema]],
  },
  academicYear: {
    type: String
},
semester: {
    type: String
}
});

const SpreadSheetFacultyTimeTable = mongoose.model('SpreadSheetFacultyTimeTable', SpreadSheetFacultyTimeTableSchema);
module.exports = SpreadSheetFacultyTimeTable;
