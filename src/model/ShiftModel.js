const mongoose = require("mongoose");
const {Schema} = mongoose;

const ShiftSchema = new Schema({
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true,
      },
      startTime: { type: String},
      endTime: { type: String },
      date: { type: String },
});

const Shift = mongoose.model('Shift', ShiftSchema);

module.exports = Shift
