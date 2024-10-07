const mongoose = require("mongoose");
const { Schema } = mongoose;

const sessionSchema = new Schema({
    time: {
        type: String,
    },
    subject: {
        type: String,
    },
    type: {
        type: String,
    },
    batch: {
        type: String,
    },
    location: {
        type: String,
    },
    faculty: {
        type: String,
    }
});

// const daySchema = new Schema({
//   day: {
//     type: String,
//     required: true,
//   },
//   sessions: {
//     type: [sessionSchema],
//     required: true
//   }
// });

const TimeTableSchema = new Schema({
  academicYear: {
    type: String,
    required: true,
  },
  semester: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    required: true,
  },
  weeklyTimetable: {
    Monday: [sessionSchema],
    Tuesday: [sessionSchema],
    Wednesday: [sessionSchema],
    Thursday: [sessionSchema],
    Friday: [sessionSchema],
    Saturday: [sessionSchema]
  }
});

const Timetable = mongoose.model('Timetable', TimeTableSchema);
module.exports = Timetable;
