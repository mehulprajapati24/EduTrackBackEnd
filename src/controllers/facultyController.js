const Timetable = require("../model/AdminTimeTableModel")
const SpreadSheetTimeTable = require("../model/SpreadSheetTimetableModel")
const SpreadSheetFacultyTimeTable = require("../model/SpreadSheetFacultyTimetableModel")
const GoogleSpreadsheetModel = require("../model/GoogleSpreadsheetModel")
const Admin = require("../model/AdminModel")
const Student = require("../model/StudentModel")
const AcademicYear = require("../model/AcademicYearModel")
const Faculty = require("../model/FacultyModel")
const Otp = require("../model/OtpModel")
const Shift = require("../model/ShiftModel")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')
const nodemailer = require("nodemailer")
const crypto = require('crypto');
const moment = require('moment');


require('dotenv').config();

const { google } = require("googleapis");

// Initialize auth - see https://googleapis.dev/nodejs/googleapis/latest/auth/index.html
const jwtClient = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Replace newline characters
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  // Define the Google Sheets API after initialization
  const sheets = google.sheets({ version: 'v4', auth: jwtClient });

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const login = async (req, res) => {
  try {
    const {enrollmentNumber, password} = req.body;

    if(!enrollmentNumber){
      return res.status(200).json({error:true, message:"Please enter your employee ID"});
    }
    else if(!password){
      return res.status(200).json({error:true, message:"Please enter your password"});
    }
    const selectedAcademicYear = await AcademicYear.findOne({selected: true});

    const faculty = await Faculty.findOne({enrollment: enrollmentNumber, academicYear: selectedAcademicYear.academicYear, semester: selectedAcademicYear.semester});
    if (!faculty) {
      return res.status(200).json({error:true, message:"Employee ID not found!"});
    }

    const isMatch = await bcrypt.compare(password, faculty.password);

    if (!isMatch) {
      return res.status(201).json({error:true, message:"Invalid password!"});
    }

    const accessToken = jwt.sign({ id: faculty._id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
    });

    var requirePasswordChange=await bcrypt.compare(process.env.password, faculty.password);;
    
    return res.status(200).json({
        error: false,
        message: "Login successful",
        accessToken,
        requirePasswordChange
    });

  } catch (error) {
    console.log(error);
  }
}


  const requireToChangePassword = async (req, res) => {
    try {
      const {password, image} = req.body;
      // console.log(password+" "+image);
      const user = req.user;
      // console.log(user.id);
      const hashedPassword = await bcrypt.hash(password, 10);

      const updatedFaculty = await Faculty.findByIdAndUpdate(
        user.id,
        { password: hashedPassword, profileLink: image },
        { new: true } // Returns the updated document
      );
      // console.log(updatedStudent);

      

      res.status(200).json({message: "ok"});
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Something wrong', error: error.message });
    }
  }

  const otp = async (req, res) => {
    const { email } = req.body;
    const selectedAcademicYear = await AcademicYear.findOne({selected: true});
    const faculty = await Faculty.findOne({ 
        gnuemail: email,
        academicYear: selectedAcademicYear.academicYear,
        semester: selectedAcademicYear.semester
    });

    if (!faculty) {
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

const changePassword = async (req, res)=>{
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const selectedAcademicYear = await AcademicYear.findOne({selected: true});

  const faculty = await Faculty.findOne({ gnuemail: email, academicYear: selectedAcademicYear.academicYear, semester: selectedAcademicYear.semester });
  if (faculty) {
      faculty.password = hashedPassword;
      await faculty.save();
      res.json({ error: false, message: "Password changed successfully" });
      }
}

const getProfile = async (req, res) => {
  const user = req.user;
  const faculty = await Faculty.findById(user.id);

  let name = faculty.name;
  res.json({name});
}

const getSchedule = async (req, res) => {
  try {
    const user = req.user;
    var time="";

    const faculty = await Faculty.findById(user.id);
    
    const nameParts = faculty.name.split(" ");
    const initials = nameParts.map(part => part[0]).join("");

    const schedule = [];

    const selectedAcademicYear = await AcademicYear.findOne({selected: true});


    const spreadSheetFacultyTimeTable = await SpreadSheetFacultyTimeTable.findOne({ facultyName: initials, academicYear: selectedAcademicYear.academicYear, semester: selectedAcademicYear.semester });
    const timeArray = [];
    for(let i=0; i<spreadSheetFacultyTimeTable.weeklyTimetable.Monday[0].length; i++){
        timeArray.push(spreadSheetFacultyTimeTable.weeklyTimetable.Monday[0][i].time);
    }

    const currentDate = new Date();
    var day = currentDate.getDay();

    // day=2;

    if(day == 0){
      return res.status(200).json({ schedule });
    }

    var data = [];
        if(day ==1 ){
            data = spreadSheetFacultyTimeTable.weeklyTimetable.Monday;
        }
        else if(day == 2){
            data = spreadSheetFacultyTimeTable.weeklyTimetable.Tuesday;
        }
        else if(day == 3){
            data = spreadSheetFacultyTimeTable.weeklyTimetable.Wednesday;
        }
        else if(day == 4){
            data = spreadSheetFacultyTimeTable.weeklyTimetable.Thursday;
        }
        else if(day == 5){
            data = spreadSheetFacultyTimeTable.weeklyTimetable.Friday;
        }
        else if(day == 6){
            data = spreadSheetFacultyTimeTable.weeklyTimetable.Saturday;
        }

        const currentTime = moment();
        // const currentTime = moment('08:40 AM', 'hh:mm A');

        let timeSlotIndex = -1;
        for (let i = 0; i < timeArray.length; i++) {
          const timeRange = timeArray[i]; // e.g., '08:30 AM to 09:15 AM'
          const [startTime, endTime] = timeRange.split(' to ').map(t => moment(t, 'hh:mm A'));

          // Use moment to check if the selected time is within the range
          if (currentTime.isBetween(startTime, endTime, null, '[)')) {
              timeSlotIndex = i;
              break;
          }
      }

      if(timeSlotIndex==-1){
        return res.status(200).json({ schedule });
    }

    var location = "";
    var obj = {
      type: '',
      subject: '',
      faculty: '',
      time: '',
      location: ''
    };
    var flag=0;
        for(let i=0; i<data.length; i++){
          if(data[i][timeSlotIndex].type=="Break"){
            flag=1;
            obj = {
              type: '',
              subject: '',
              faculty: '',
              time: '',
              location: ''
            };
            obj.type = data[i][timeSlotIndex].type;
            obj.time = data[i][timeSlotIndex].time;
            schedule.push(obj);

            if(data[i][timeSlotIndex+1]){
              obj = {
                type: '',
                subject: '',
                faculty: '',
                time: '',
                location: ''
              };
              
              obj.location = data[i][timeSlotIndex+1].location;
              obj.type = data[i][timeSlotIndex+1].type;
              obj.subject = data[i][timeSlotIndex+1].subject;
              obj.faculty = data[i][timeSlotIndex+1].faculty;
              obj.time = timeArray[timeSlotIndex+1];
              if(obj.type=="Lab"){
                var time1=timeArray[timeSlotIndex+1];
                var time2=timeArray[timeSlotIndex+2];
                let startTime = time1.split(" to ")[0];
                let endTime = time2.split(" to ")[1];
                obj.time = startTime + " to " + endTime;
              }
              schedule.push(obj);
            }
            break;
          }
          else if(data[i][timeSlotIndex].type=="No Teaching Load"){
            flag=1;
            obj = {
              type: '',
              subject: '',
              faculty: '',
              time: '',
              location: ''
            };
            obj.type = data[i][timeSlotIndex].type;
            obj.time = data[i][timeSlotIndex].time;
            schedule.push(obj);

            if(data[i][timeSlotIndex+1]){
              obj = {
                type: '',
                subject: '',
                faculty: '',
                time: '',
                location: ''
              };
              
              obj.location = data[i][timeSlotIndex+1].location;
              obj.type = data[i][timeSlotIndex+1].type;
              obj.subject = data[i][timeSlotIndex+1].subject;
              obj.faculty = data[i][timeSlotIndex+1].faculty;
              obj.time = timeArray[timeSlotIndex+1];
              if(obj.type=="Lab"){
                var time1=timeArray[timeSlotIndex+1];
                var time2=timeArray[timeSlotIndex+2];
                let startTime = time1.split(" to ")[0];
                let endTime = time2.split(" to ")[1];
                obj.time = startTime + " to " + endTime;
              }
              schedule.push(obj);
            }

            break;
          }
            else{
              obj = {
                type: '',
                subject: '',
                faculty: '',
                time: '',
                location: ''
              };

                location = data[i][timeSlotIndex].location;
                if(data[i][timeSlotIndex].type=="Lab" && data[i][timeSlotIndex+1].type=="Lab"){
                    var time1=timeArray[timeSlotIndex];
                    var time2=timeArray[timeSlotIndex+1];
                    let startTime = time1.split(" to ")[0];
                    let endTime = time2.split(" to ")[1];
                    time = startTime + " to " + endTime;

                    obj.type = data[i][timeSlotIndex].type;
                    obj.subject = data[i][timeSlotIndex].subject;
                    obj.faculty = data[i][timeSlotIndex].faculty;
                    obj.time = time;
                    obj.location=location;
                    schedule.push(obj);

                    if(data[i][timeSlotIndex+2]){
                      // console.log("ok");
                      obj = {
                        type: '',
                        subject: '',
                        faculty: '',
                        time: '',
                        location: ''
                      };
                      
                      obj.location = data[i][timeSlotIndex+2].location;
                      obj.type = data[i][timeSlotIndex+2].type;
                      obj.subject = data[i][timeSlotIndex+2].subject;
                      obj.faculty = data[i][timeSlotIndex+2].faculty;
                      obj.time = timeArray[timeSlotIndex+2];
                      schedule.push(obj);
                }
              }
              else if(data[i][timeSlotIndex].type=="Lab"){
                    obj.type = data[i][timeSlotIndex].type;
                    obj.subject = data[i][timeSlotIndex].subject;
                    obj.faculty = data[i][timeSlotIndex].faculty;
                    // obj.time = data[i][timeSlotIndex].time;
                    obj.location=location;
                    var time1=timeArray[timeSlotIndex-1];
                    var time2=timeArray[timeSlotIndex];
                    let startTime = time1.split(" to ")[0];
                    let endTime = time2.split(" to ")[1];
                    time = startTime + " to " + endTime;
                    obj.time=time;
                    schedule.push(obj);

                    if(data[i][timeSlotIndex+1]){
                      // console.log("ok");
                      obj = {
                        type: '',
                        subject: '',
                        faculty: '',
                        time: '',
                        location: ''
                      };
                      
                      obj.location = data[i][timeSlotIndex+1].location;
                      obj.type = data[i][timeSlotIndex+1].type;
                      obj.subject = data[i][timeSlotIndex+1].subject;
                      obj.faculty = data[i][timeSlotIndex+1].faculty;
                      obj.time = timeArray[timeSlotIndex+1];
                      schedule.push(obj);
                }
              }
                else{
                    time=timeArray[timeSlotIndex];

                    obj.type = data[i][timeSlotIndex].type;
                    obj.subject = data[i][timeSlotIndex].subject;
                    obj.faculty = data[i][timeSlotIndex].faculty;
                    obj.time = time;
                    obj.location=location;
                    schedule.push(obj);
                    
                    if(data[i][timeSlotIndex+1]){
                      obj = {
                        type: '',
                        subject: '',
                        faculty: '',
                        time: '',
                        location: ''
                      };
                      
                      obj.location = data[i][timeSlotIndex+1].location;
                      obj.type = data[i][timeSlotIndex+1].type;
                      obj.subject = data[i][timeSlotIndex+1].subject;
                      obj.faculty = data[i][timeSlotIndex+1].faculty;
                      obj.time = timeArray[timeSlotIndex+1];

                      if(obj.type=="Lab"){
                        var time1=timeArray[timeSlotIndex+1];
                        var time2=timeArray[timeSlotIndex+2];
                        let startTime = time1.split(" to ")[0];
                        let endTime = time2.split(" to ")[1];
                        obj.time = startTime + " to " + endTime;
                      }
                      schedule.push(obj);
                    }
                }
                break;
            }
        }

    return res.status(200).json({ schedule });

  } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Something wrong', error: error.message });
  }
}

const getFacultyTimetable = async (req, res) => {
  try {
    const user = req.user;
    const faculty = await Faculty.findById(user.id);

    // console.log(faculty);

    let timetable1;

    const selectedAcademicYear = await AcademicYear.findOne({selected: true});


        let sheetId = await GoogleSpreadsheetModel.find({academicYear: selectedAcademicYear.academicYear, semester: selectedAcademicYear.semester});
        let spreadsheetId = sheetId[0].sheetId;

        const fullName = faculty.name;
        const initials = fullName.split(" ").map(name => name[0]).join("");


        // console.log(initials);

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: initials,
          });

        timetable1 = response.data.values;

        // console.log(timetable1);
        timetable1[0][0] = timetable1[0][0].split("/").reverse().join("/");

        let timetable = [];

        for(let i=0; i<timetable1.length; i++){
            for(let j=0; j<timetable1[i].length; j++){
                if (!timetable[j]) {
                    timetable[j] = [];
                }
                timetable[j][i] = timetable1[i][j];
            }
        }

        // console.log(timetable);

        res.json({ timetable });
  } catch (error) {
    res.status(500).json({ message: 'Something wrong', error: error.message });
  }
}


const getFacultyTimetableBasedOnDay = async (req, res) => {
  var { day } = req.query;
  day = parseInt(day);
  try {
    const user = req.user;
    const faculty = await Faculty.findById(user.id);

    let timetable1;

    const selectedAcademicYear = await AcademicYear.findOne({selected: true});


        let sheetId = await GoogleSpreadsheetModel.find({academicYear: selectedAcademicYear.academicYear, semester: selectedAcademicYear.semester});
        let spreadsheetId = sheetId[0].sheetId;

        const fullName = faculty.name;
        const initials = fullName.split(" ").map(name => name[0]).join("");


        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: initials,
          });

        timetable1 = response.data.values;
        // console.log(timetable1);
        timetable1[0][0] = timetable1[0][0].split("/").reverse().join("/");

        let timetable = [];

      let timetable2 = [];
      timetable2.push(timetable1[0]);
      timetable2.push(timetable1[day]);

        for(let i=0; i<timetable2.length; i++){
            for(let j=0; j<timetable2[i].length; j++){
                if (!timetable[j]) {
                    timetable[j] = [];
                }
                timetable[j][i] = timetable2[i][j];
            }
        }

        // console.log(timetable);

        res.json({ timetable });
  } catch (error) {
    res.status(500).json({ message: 'Something wrong', error: error.message });
  }
}


const getFacultyTimetableBasedOnTime = async (req, res) => {
  var { day, time } = req.query;
  day = parseInt(day);
  try {
    const user = req.user;
    const faculty = await Faculty.findById(user.id);

    let timetable1;

    const selectedAcademicYear = await AcademicYear.findOne({selected: true});


        let sheetId = await GoogleSpreadsheetModel.find({academicYear: selectedAcademicYear.academicYear, semester: selectedAcademicYear.semester});
        let spreadsheetId = sheetId[0].sheetId;

        const fullName = faculty.name;
        const initials = fullName.split(" ").map(name => name[0]).join("");


        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: initials,
          });

        timetable1 = response.data.values;
        // console.log(timetable1);
        timetable1[0][0] = timetable1[0][0].split("/").reverse().join("/");

        let timetable = [];
        let timetable2 = [];

        timetable2.push(timetable1[0]);
        timetable2.push(timetable1[day]);


      let timeSlotIndex = -1;
      for (let i = 1; i < timetable2[0].length; i++) {
        const timeRange = timetable2[0][i]; // e.g., '08:30 AM to 09:15 AM'
        const [startTime, endTime] = timeRange.split(' to ').map(t => moment(t, 'hh:mm A'));

        // Use moment to check if the selected time is within the range
        if (moment(time, 'HH:mm').isBetween(startTime, endTime, null, '[)')) {
            timeSlotIndex = i;
            break;
        }
    }


    if (timeSlotIndex === -1) {
      // console.log("error");
        return res.status(404).json({ error: 'No class found at the selected time.' });
    }

    // console.log(timeSlotIndex);

    let timetable3 = [
      [timetable2[0][0], timetable2[0][timeSlotIndex]],
      [timetable2[1][0], timetable2[1][timeSlotIndex]]
  ];


        for(let i=0; i<timetable3.length; i++){
            for(let j=0; j<timetable3[i].length; j++){
                if (!timetable[j]) {
                    timetable[j] = [];
                }
                timetable[j][i] = timetable3[i][j];
            }
        }

        // console.log(timetable);

        res.json({ timetable });
  } catch (error) {
    res.status(500).json({ message: 'Something wrong', error: error.message });
  }
}

const startShift = async (req, res) => {
  try {
    var {startTime} = req.body;
    const user = req.user;

    const [hours, minutes] = startTime.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const adjustedHours = hours % 12 || 12;
    startTime = `${String(adjustedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;

    // console.log(startTime);

    const currentDate = new Date();

    const day = String(currentDate.getDate()).padStart(2, '0'); // Day of the month (01-31)
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed (01-12)
    const year = currentDate.getFullYear(); // Full year (e.g., 2024)

    const formattedDate = `${day}-${month}-${year}`;

    // console.log(formattedDate); // Output: 'DD-MM-YYYY'
    const selectedAcademicYear = await AcademicYear.findOne({selected: true});


    const newShift = new Shift({
      facultyId: user.id,
      startTime: startTime,
      date: formattedDate,
      academicYear: selectedAcademicYear.academicYear,
      semester: selectedAcademicYear.semester
    });

    await newShift.save();

    res.status(201).json({ error: false, message: 'Shift start time recorded successfully', shift: newShift });

  } catch (error) {
    res.status(500).json({ message: 'Something wrong', error: error.message });
  }
}


const endShift = async (req, res) => {
  try {
    var {endTime} = req.body;
    const user = req.user;

    const [hours, minutes] = endTime.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const adjustedHours = hours % 12 || 12;
    endTime = `${String(adjustedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;


    const currentDate = new Date();

    const day = String(currentDate.getDate()).padStart(2, '0'); // Day of the month (01-31)
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed (01-12)
    const year = currentDate.getFullYear(); // Full year (e.g., 2024)

    const formattedDate = `${day}-${month}-${year}`;


    const updatedShift = await Shift.findOneAndUpdate(
      { facultyId: user.id, date: formattedDate }, // Ensure it’s the correct shift for today
      { endTime: endTime },
      { new: true } // This option returns the updated document
    );

    res.status(201).json({ error: false, message: 'Shift start time recorded successfully', shiftTime: updatedShift.startTime + " to " + updatedShift.endTime });

  } catch (error) {
    res.status(500).json({ message: 'Something wrong', error: error.message });
  }
}


const getFields = async (req, res) => {
  try {
    const user = req.user;

    const currentDate = new Date();

    const day = String(currentDate.getDate()).padStart(2, '0'); // Day of the month (01-31)
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed (01-12)
    const year = currentDate.getFullYear(); // Full year (e.g., 2024)

    const formattedDate = `${day}-${month}-${year}`;

    const shift = await Shift.findOne({facultyId: user.id, date: formattedDate});
    if(shift){
      // console.log(shift.endTime);
      if(!shift.endTime){
        return res.status(201).json({ startDisplay: false, endDisplay: true });
      }else{
        return res.status(201).json({ startDisplay: false, endDisplay: false, shiftTime: shift.startTime + " to " + shift.endTime });
      }
    }else{
      return res.status(201).json({ startDisplay: true, endDisplay: false });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Something wrong', error: error.message });
  }
}

const getShiftsOfFaculty = async(req, res) => {
  try {
    const user = req.user;
    const facultyId = user.id;
    var shifts = [];
    shifts = await Shift.find({facultyId: facultyId}).sort({date: -1});
    // console.log(shifts);
    res.status(201).json({ error: false, shifts: shifts });
  }catch (error) {
    return res.status(500).json({ message: 'Something wrong', error: error.message });
  }
}


const getClassSheets = async (req, res) => {
  const selectedAcademicYear = await AcademicYear.findOne({selected: true});

  try {
    // Fetch data from both models

    const classTimetables = await SpreadSheetTimeTable.find({academicYear:  selectedAcademicYear.academicYear, semester: selectedAcademicYear.semester});


    var sheets=[];

    for(let i of classTimetables){
        sheets.push(i.class);
    }

    // Send a response to indicate successful fetch
    res.status(200).json({
      success: true,
      message: 'Data fetched successfully',
      sheets
    });
  } catch (error) {
    console.error('Error fetching timetables:', error);

    // Send an error response if something goes wrong
    res.status(500).json({
      success: false,
      message: 'Error fetching timetables',
      error: error.message,
    });
  }
};


const getLocationBasedOnClassSelection = async (req, res) => {
  const {selectedClass} = req.body;
  const selectedAcademicYear = await AcademicYear.findOne({selected: true});

  const className = selectedClass;
  const information = [];

  try {
      var time="";
      // const { className, batch } = req.body;
      // const selectedAcademicYear = await AcademicYear.findOne({selected: true});
      // console.log(className, batch);
      const spreadSheetTimeTable = await SpreadSheetTimeTable.findOne({ class: className, academicYear:  selectedAcademicYear.academicYear, semester: selectedAcademicYear.semester });
      const timeArray = [];
      for(let i=0; i<spreadSheetTimeTable.weeklyTimetable.Monday[0].length; i++){
          timeArray.push(spreadSheetTimeTable.weeklyTimetable.Monday[0][i].time);
      }
      // console.log(timeArray);
      const currentDate = new Date();
      var day = currentDate.getDay();
      // day=2;

      if(day == 0){
          return res.status(200).json({ information });
      }

      var data = [];
      if(day ==1 ){
          data = spreadSheetTimeTable.weeklyTimetable.Monday;
      }
      else if(day == 2){
          data = spreadSheetTimeTable.weeklyTimetable.Tuesday;
      }
      else if(day == 3){
          data = spreadSheetTimeTable.weeklyTimetable.Wednesday;
      }
      else if(day == 4){
          data = spreadSheetTimeTable.weeklyTimetable.Thursday;
      }
      else if(day == 5){
          data = spreadSheetTimeTable.weeklyTimetable.Friday;
      }
      else if(day == 6){
          data = spreadSheetTimeTable.weeklyTimetable.Saturday;
      }

      // console.log(data);
      const currentTime = moment();
      // const currentTime = moment('08:39 AM', 'hh:mm A');

      let timeSlotIndex = -1;
      for (let i = 0; i < timeArray.length; i++) {
          const timeRange = timeArray[i]; // e.g., '08:30 AM to 09:15 AM'
          const [startTime, endTime] = timeRange.split(' to ').map(t => moment(t, 'hh:mm A'));

          // Use moment to check if the selected time is within the range
          if (currentTime.isBetween(startTime, endTime, null, '[)')) {
              timeSlotIndex = i;
              break;
          }
      }

      // console.log(data);


      if(timeSlotIndex==-1){
          return res.status(200).json({ information });
      }

      var location = "";
      var type = "";
      var subject = "";
      var classbatch = "";
      var faculty = "";


          for(let i=0; i<data.length; i++){
                  location = data[i][timeSlotIndex].location;
                  type = data[i][timeSlotIndex].type;
                  subject = data[i][timeSlotIndex].subject;
                  classbatch = data[i][timeSlotIndex].classbatch;
                  faculty = data[i][timeSlotIndex].faculty;
                  if(data[i][timeSlotIndex].type=="Lab" && data[i][timeSlotIndex+1].type=="Lab"){
                      var time1=timeArray[timeSlotIndex];
                      var time2=timeArray[timeSlotIndex+1];
                      let startTime = time1.split(" to ")[0];
                      let endTime = time2.split(" to ")[1];
                      time = startTime + " to " + endTime;
                  }
                  else if(data[i][timeSlotIndex].type=="Lab"){
                      var time1=timeArray[timeSlotIndex-1];
                      var time2=timeArray[timeSlotIndex];
                      let startTime = time1.split(" to ")[0];
                      let endTime = time2.split(" to ")[1];
                      time = startTime + " to " + endTime;
                  }
                  else{
                      time=timeArray[timeSlotIndex];
                  }
                  information.push({type, time, subject, classbatch, faculty, location});
          }
      

      if(data.length>1 && information[0].classbatch != information[data.length-1].classbatch){
          return res.status(200).json({ information, isClass: false });
      }

      return res.status(200).json({ information, isClass: true });
  } catch (error) {
      console.log(error);
      
  }
}





  module.exports = {
    login,
    requireToChangePassword,
    otp,
    validateOtpLogin,
    changePassword,
    getProfile,
    getSchedule,
    getFacultyTimetable,
    getFacultyTimetableBasedOnDay,
    getFacultyTimetableBasedOnTime,
    startShift,
    endShift,
    getFields,
    getShiftsOfFaculty,
    getClassSheets,
    getLocationBasedOnClassSelection
  };