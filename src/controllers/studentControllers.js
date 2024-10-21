const ClassBatch = require("../model/AdminClassBatchModel")
const Timetable = require("../model/AdminTimeTableModel")
const Admin = require("../model/AdminModel")
const Student = require("../model/StudentModel")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')


require('dotenv').config();

const login = async (req, res) => {
  try {
    const {enrollmentNumber, password} = req.body;

    if(!enrollmentNumber){
      res.status(201).json({error:true, message:"Please enter your enrollment number"});
    }
    else if(!password){
      res.status(201).json({error:true, message:"Please enter your password"});
    }
    const student = await Student.findOne({enrollment: enrollmentNumber});
    if (!student) {
      res.status(201).json({error:true, message:"Enrollment not found!"});
    }
    
    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      res.status(201).json({error:true, message:"Invalid password!"});
    }

    const accessToken = jwt.sign({ id: student._id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
    });

    return res.status(200).json({
        error: false,
        message: "Login successful",
        accessToken
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
  
  module.exports = {
    getTimetable,
    login
  };