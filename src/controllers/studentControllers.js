const ClassBatch = require("../model/AdminClassBatchModel")
const Timetable = require("../model/AdminTimeTableModel")
const SpreadSheetTimeTable = require("../model/SpreadSheetTimetableModel")
const GoogleSpreadsheetModel = require("../model/GoogleSpreadsheetModel")
const Admin = require("../model/AdminModel")
const AcademicYear = require("../model/AcademicYearModel")
const Student = require("../model/StudentModel")
const Faculty = require("../model/FacultyModel")
const Otp = require("../model/OtpModel")
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
      return res.status(200).json({error:true, message:"Please enter your enrollment number"});
    }
    else if(!password){
      return res.status(200).json({error:true, message:"Please enter your password"});
    }
    const selectedAcademicYear = await AcademicYear.findOne({selected: true});

    const student = await Student.findOne({enrollment: enrollmentNumber, academicYear: selectedAcademicYear.academicYear, sem:selectedAcademicYear.semester});
    if (!student) {
      return res.status(200).json({error:true, message:"Enrollment not found!"});
    }

    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      return res.status(201).json({error:true, message:"Invalid password!"});
    }

    const accessToken = jwt.sign({ id: student._id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
    });

    console.log(accessToken);

    var requirePasswordChange=await bcrypt.compare(process.env.password, student.password);;
    
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

const getTimetable = async (req, res) => {
    try {
      const timetable = await Timetable.findOne({
        academicYear: '2024-2025', // Adjust as necessary or make dynamic
        semester: '7', // Adjust as necessary or make dynamic
        class: '7CE-C', // Adjust as necessary or make dynamic
      });

      if (!timetable) {
        return res.status(404).json({ message: 'Timetable not found' });
      }
  
      res.status(200).json({timetable: timetable});
    } catch (error) {
      console.error('Error fetching timetable:', error);
      res.status(500).json({ message: 'Failed to fetch timetable', error: error.message });
    }
  };

  const updateProfileImage = async (req, res) => {
    try {
      const {image} = req.body;
      const user = req.user;

      const updatedStudent = await Student.findByIdAndUpdate(
        user.id,
        { profileLink: image },
        { new: true } // Returns the updated document
      );
      res.status(200).json({profile: updatedStudent});
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Something wrong', error: error.message });
    }
  }

  const requireToChangePassword = async (req, res) => {
    try {
      const {password, image} = req.body;
      // console.log(password+" "+image);
      const user = req.user;
      // console.log(user.id);
      const hashedPassword = await bcrypt.hash(password, 10);

      const updatedStudent = await Student.findByIdAndUpdate(
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

    const student = await Student.findOne({ 
      $and: [
        { $or: [{ email: email }, { gnuemail: email }] },
        { academicYear: selectedAcademicYear.academicYear },
        { sem: selectedAcademicYear.semester }
      ]
    });

    if (!student) {
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

  const student = await Student.findOne({ 
    $and: [
      { $or: [{ email: email }, { gnuemail: email }] },
      { academicYear: selectedAcademicYear.academicYear },
      { sem: selectedAcademicYear.semester }
    ]
  });

  if (student) {
      student.password = hashedPassword;
      await student.save();
      res.json({ error: false, message: "Password changed successfully" });
      }
}

const getProfile = async (req, res) => {
  const user = req.user;
  const student = await Student.findById(user.id);

  let profile = student.enrollment.charAt(0) + student.name.charAt(0);
  res.json({profile});
}

const fetchProfile = async (req, res) => {
  const user = req.user;
  const student = await Student.findById(user.id);

  let profile = student;
  res.json({profile});
}




const getFaculties = async (req, res) => {
  const selectedAcademicYear = await AcademicYear.findOne({selected: true});

  const faculties = await Faculty.find({academicYear: selectedAcademicYear.academicYear, semester: selectedAcademicYear.semester});
  // console.log(faculties);
  res.json({faculties});
}

const getStudentTimetableBasedOnTime = async (req, res) => {
  var { day, time } = req.query;
  day = parseInt(day);
  try {
    const user = req.user;
    const student = await Student.findById(user.id);

    const sheetName = student.class;
    const batch = student.batch;

    // console.log(batch);
    const match = batch.match(/(\d+)$/);
    var part = match ? match[1] : null;
    part=parseInt(part);
    // console.log(part);

    // console.log(sheetName);
    let timetable1;

        let sheetId = await GoogleSpreadsheetModel.find();
        let spreadsheetId = sheetId[0].sheetId;


        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: sheetName,
          });

        timetable1 = response.data.values;
        // console.log(timetable1);
        timetable1[0][0] = timetable1[0][0].split("/").reverse().join("/");

        let timetable = [];
        let timetable2 = [];

      timetable2.push(timetable1[0]);
      // console.log(timetable1.length);
      // console.log(part);
      var jump=1;
      if(timetable1.length==13){
        jump=2;
      }
      else if(timetable1.length==19){
        jump=3;
      }
      else if(timetable1.length==25){
        jump=4;
      }
      else if(timetable1.length==31){
        jump=5;
      }

      for(var i=part; i<timetable1.length; i=i+jump){
        // console.log(i);
        timetable2.push(timetable1[i]);
      }

      let timetable3 = [];
      timetable3.push(timetable2[0]);
      timetable3.push(timetable2[day]);


      let timeSlotIndex = -1;
      for (let i = 1; i < timetable3[0].length; i++) {
        const timeRange = timetable3[0][i]; // e.g., '08:30 AM to 09:15 AM'
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

    let timetable4 = [
      [timetable3[0][0], timetable3[0][timeSlotIndex]],
      [timetable3[1][0], timetable3[1][timeSlotIndex]]
  ];


        for(let i=0; i<timetable4.length; i++){
            for(let j=0; j<timetable4[i].length; j++){
                if (!timetable[j]) {
                    timetable[j] = [];
                }
                timetable[j][i] = timetable4[i][j];
            }
        }

        // console.log(timetable);

        res.json({ timetable });
  } catch (error) {
    res.status
  }
}

const getStudentTimetableBasedOnDay = async (req, res) => {
  var { day } = req.query;
  day = parseInt(day);
  try {
    const user = req.user;
    const student = await Student.findById(user.id);

    const sheetName = student.class;
    const batch = student.batch;

    // console.log(batch);
    const match = batch.match(/(\d+)$/);
    var part = match ? match[1] : null;
    part=parseInt(part);
    // console.log(part);

    // console.log(sheetName);
    let timetable1;

        let sheetId = await GoogleSpreadsheetModel.find();
        let spreadsheetId = sheetId[0].sheetId;


        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: sheetName,
          });

        timetable1 = response.data.values;
        // console.log(timetable1);
        timetable1[0][0] = timetable1[0][0].split("/").reverse().join("/");

        let timetable = [];
        let timetable2 = [];

      timetable2.push(timetable1[0]);
      // console.log(timetable1.length);
      // console.log(part);
      var jump=1;
      if(timetable1.length==13){
        jump=2;
      }
      else if(timetable1.length==19){
        jump=3;
      }
      else if(timetable1.length==25){
        jump=4;
      }
      else if(timetable1.length==31){
        jump=5;
      }

      for(var i=part; i<timetable1.length; i=i+jump){
        // console.log(i);
        timetable2.push(timetable1[i]);
      }

      let timetable3 = [];
      timetable3.push(timetable2[0]);
      timetable3.push(timetable2[day]);

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
    res.status
  }
}

const getStudentTimetable = async (req, res) => {
  try {
    const user = req.user;
    const student = await Student.findById(user.id);

    const sheetName = student.class;
    const batch = student.batch;

    // console.log(batch);
    const match = batch.match(/(\d+)$/);
    var part = match ? match[1] : null;
    part=parseInt(part);
    // console.log(part);

    // console.log(sheetName);
    let timetable1;

        let sheetId = await GoogleSpreadsheetModel.find();
        let spreadsheetId = sheetId[0].sheetId;


        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: sheetName,
          });

        timetable1 = response.data.values;
        // console.log(timetable1);
        timetable1[0][0] = timetable1[0][0].split("/").reverse().join("/");

        let timetable = [];
        let timetable2 = [];

      timetable2.push(timetable1[0]);
      // console.log(timetable1.length);
      // console.log(part);
      var jump=1;
      if(timetable1.length==13){
        jump=2;
      }
      else if(timetable1.length==19){
        jump=3;
      }
      else if(timetable1.length==25){
        jump=4;
      }
      else if(timetable1.length==31){
        jump=5;
      }

      for(var i=part; i<timetable1.length; i=i+jump){
        // console.log(i);
        timetable2.push(timetable1[i]);
      }

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
    res.status
  }
}

const getSchedule = async (req, res) => {
  try {
    const user = req.user;
    var time="";

    const student = await Student.findById(user.id);
    // const student = await Student.findOne({class:"5CE-B", batch: "5CE-B-1"});
    // console.log(student);
    const className = student.class;
    const batch = student.batch;
    const schedule = [];

    const spreadSheetTimeTable = await SpreadSheetTimeTable.findOne({ class: className });
    const timeArray = [];
    for(let i=0; i<spreadSheetTimeTable.weeklyTimetable.Monday[0].length; i++){
        timeArray.push(spreadSheetTimeTable.weeklyTimetable.Monday[0][i].time);
    }

    const currentDate = new Date();
    var day = currentDate.getDay();

    // day=2;

    if(day == 0){
      return res.status(200).json({ schedule });
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

        const currentTime = moment();
        // const currentTime = moment('08:45 AM', 'hh:mm A');

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
            else if(data[i][timeSlotIndex].classbatch.includes(batch)){
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

        if(location==""){
          for(let i=0; i<data.length; i++){
            if(data[i][timeSlotIndex].type=="Break" && flag==0){
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
            else if(data[i][timeSlotIndex].type=="No Teaching Load" && flag==0){
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
              else if(data[i][timeSlotIndex].classbatch.includes(className)){
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
                      obj.location = location;
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
      }

      // console.log(schedule);

    //   if(location=="" || location=="-"){
    //     location = "Not available";
    // }

    return res.status(200).json({ schedule });

  } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Something wrong', error: error.message });
  }
}

  module.exports = {
    getTimetable,
    login,
    requireToChangePassword,
    otp,
    getFaculties,
    getSchedule,
    validateOtpLogin,
    changePassword,
    getProfile,
    getStudentTimetable,
    getStudentTimetableBasedOnDay,
    getStudentTimetableBasedOnTime,
    fetchProfile,
    updateProfileImage
  };