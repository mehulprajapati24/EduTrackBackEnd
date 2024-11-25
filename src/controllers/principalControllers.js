// const Timetable = require("../model/AdminTimeTableModel")
const ClassBatch = require("../model/AdminClassBatchModel")
const Timetable = require("../model/AdminTimeTableModel")
const Session = require("../model/SessionModel")
const Admin = require("../model/AdminModel")
const AcademicYear = require("../model/AcademicYearModel")
const SpreadSheetTimeTable = require("../model/SpreadSheetTimetableModel")
const SpreadSheetFacultyTimeTable = require("../model/SpreadSheetFacultyTimetableModel")
const Student = require("../model/StudentModel")
const Faculty = require("../model/FacultyModel")
const Resource = require("../model/ResourceModel")
const Principal = require("../model/PrincipalModel")
const GoogleSpreadsheetModel = require("../model/GoogleSpreadsheetModel")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const moment = require('moment-timezone');
const crypto = require('crypto');
const nodemailer = require("nodemailer");
const Otp = require("../model/OtpModel")


const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

// Initialize auth - see https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication
const serviceAccountAuth = new JWT({
    // env var values here are copied from service account credentials generated by google
    // see "Authentication" section in docs for more info
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const { google } = require("googleapis");
const Shift = require("../model/ShiftModel")


// Initialize auth - see https://googleapis.dev/nodejs/googleapis/latest/auth/index.html
const jwtClient = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Replace newline characters
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  // Define the Google Sheets API after initialization
  const sheets = google.sheets({ version: 'v4', auth: jwtClient });

require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const validatePrincipal = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ error: true, message: "Email and password are required" });
    }

    const principal = await Principal.findOne({ email: email });

    if (!principal) {
        return res.json({ error: true, message: "Invalid email" });
    }

    const match = await bcrypt.compare(password, principal.password);

    if (!match) {
        return res.json({ error: true, message: "Invalid password" });
    }

    const accessToken = jwt.sign({ principalId: principal._id, email: principal.email, role: "principal" }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
    });

    return res.status(200).json({ 
        error: false,
        message: "Login successful",
        accessToken
    });
}

const validate = async (req, res) => {
    res.json({
        error: false,
        principal: req.user,
     });
}

const otp = async (req, res) => {
    const { email } = req.body;
    const principal = await Principal.findOne({ 
        email
    });

    if (!principal) {
        return res.json({ error: true, message: "Email not found" });
    }
    
    const otp = (crypto.randomInt(100000, 1000000)).toString();
    const otpExpires = Date.now() + 60000; // OTP expires in 1 minute

    // Check for existing OTP data
    let otp_data = await Otp.findOne({ email: email });

    if (otp_data) {
        // If document exists, update it
        otp_data.otp = otp;
        otp_data.otpExpires = otpExpires;
    } else {
        // If document does not exist, create a new one
        otp_data = new Otp({
            email: email,
            otp: otp,
            otpExpires: otpExpires
        });
    }

    // Save the OTP data (either updated or newly created)
    await otp_data.save();

    // Send OTP email
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'OTP for verification from Edu-Track-UVPCE',
        text: `Your OTP is ${otp}`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('Error sending email:', err);
            return res.json({ error: true, message: 'Error sending OTP' });
        }
        res.status(201).json({ error: false, message: "OTP sent" });
    });
};

const changePassword = async (req, res)=>{
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const principal = await Principal.findOne({ email });
    if (principal) {
        principal.password = hashedPassword;
        await principal.save();
        res.json({ error: false, message: "Password changed successfully" });
        }
  }


  const validateOtpLogin = async (req, res) => {
    const { email, otp } = req.body;
      
          let otp_data = await Otp.findOne({ email: email });
         
          if (otp_data.otpExpires < Date.now()) {
              return res.json({ error: true, message: "Expired OTP! Please click on resend otp" });
          }
          if (otp !== otp_data.otp) {
              return res.json({ error: true, message: "Invalid OTP" });
              }
          
          res.json({ error: false, message: "OTP verified" });
  }



module.exports = {
    validatePrincipal,
    otp,
    changePassword,
    validate,
    validateOtpLogin
}