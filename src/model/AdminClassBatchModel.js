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
  classes: [
    {
      className: {
        type: String,
        required: true,
      },
      batches: [
        {
          type: String,
          required: true,
        },
      ],
    },
  ],
});

const ClassBatch = mongoose.model('ClassBatch', ClassBatchSchema);
module.exports = ClassBatch;