const ClassBatch = require("../model/AdminClassBatchModel")
const Timetable = require("../model/AdminTimeTableModel")
const Admin = require("../model/AdminModel")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')

require('dotenv').config();

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
  };