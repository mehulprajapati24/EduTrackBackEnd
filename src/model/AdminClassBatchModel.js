const mongoose = require("mongoose");
const { Schema } = mongoose;

const ClassBatchSchema = new Schema({
  academicYear: {
    type: String,
    required: true,
  },
  semester: {
    type: String,
    required: true,
  },
  classes: {
    type: [String], // Array of strings
    required: true,
  },
  batches: {
    type: [String], // Array of strings
    required: true,
  },
});

const ClassBatch = mongoose.model('ClassBatch', ClassBatchSchema);
module.exports = ClassBatch;
