const mongoose = require("mongoose");
const {Schema} = mongoose;

const GoogleSpreadsheetSchema = new Schema({
    sheetId: {
        type: String,
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        required: true
    }
});

const GoogleSpreadsheet = mongoose.model('GoogleSpreadsheet', GoogleSpreadsheetSchema);

module.exports = GoogleSpreadsheet