const mongoose = require("mongoose");
const { Schema } = mongoose;

const sessionSchema = new Schema({
    timeFrom: {
        type: String,
        required: true,
    },
    timeTo: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
    },
    type: {
        type: String,
        required: true,
    },
    batch: {
        type: String,
    },
    freeSessionBatch: {
        type: String,
    },
    location: {
        type: String,
    },
    faculty: {
        type: String,
    }
});

const daySchema = new Schema({
  day: {
    type: String,
    required: true,
  },
  sessions: {
    type: [sessionSchema],
    required: true
  }
});

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
  days: {
    type: [daySchema],
    required: true,
  }
});

const Timetable = mongoose.model('Timetable', TimeTableSchema);
module.exports = Timetable;
