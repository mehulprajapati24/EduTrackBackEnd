const mongoose = require("mongoose");
const {Schema} = mongoose;

const OtpSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
        },
    otpExpires: {
        type: Number,
        required: true
        }

});

const Otp = mongoose.model('Otp', OtpSchema);

module.exports = Otp