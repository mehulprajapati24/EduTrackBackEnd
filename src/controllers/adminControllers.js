// const Timetable = require("../model/AdminTimeTableModel")
const ClassBatch = require("../model/AdminClassBatchModel")
const Timetable = require("../model/AdminTimeTableModel")
const Session = require("../model/SessionModel")
const Admin = require("../model/AdminModel")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')

require('dotenv').config();

const createSession = async (req, res) => {
    try {
        const { academicYear, semester, times } = req.body;
    
        // Create a new session
        const newSession = new Session({
          academicYear,
          semester,
          times,
        });
    
        // Save session to the database
        await newSession.save();
    
        // Respond with success
        res.status(201).json({ message: 'Session created successfully', session: newSession });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
}

const createClassBatch = async (req, res) => {
    const {academicYear, semester, classes, batches} = req.body;

    try {
        // Create a new instance of the Timetable model
        const newClassBatch = new ClassBatch({
            academicYear,
            semester,
            classes,
            batches
        });

        // Save the timetable to the database
        const savedClassBatch = await newClassBatch.save();

        // Send a success response
        res.status(201).json({ message: "Timetable created successfully", data: savedClassBatch });
    } catch (error) {
        // Handle any errors during saving
        res.status(500).json({ message: "Server error", error: error.message });
    }
}


const createTimeTable = async (req, res) => {
    try{
        const { academicYear, semester, selectedClass, weeklyTimetable } = req.body;

        let timetable = await Timetable.findOne({
            academicYear,
            semester,
            class: selectedClass
        });

        if (timetable) {
            timetable.weeklyTimetable = weeklyTimetable;

            await timetable.save();

            res.status(200).json({
                message: "Timetable updated successfully",
                timetable
            });
        } else{
            const newTimetable = new Timetable({
                academicYear,
                semester,
                class: selectedClass,
                weeklyTimetable
            });

            await newTimetable.save();

            res.status(201).json({
                message: "Timetable created successfully",
                timetable: newTimetable
            });
        }
    }catch (error) {
        console.error("Error creating timetable:", error);
        res.status(500).json({
            message: "Failed to create timetable",
            error: error.message
        });
    }
}


const validateAdmin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ error: true, message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email: email });

    if (!admin) {
        return res.json({ error: true, message: "Invalid email" });
    }

    const match = await bcrypt.compare(password, admin.password);

    if (!match) {
        return res.json({ error: true, message: "Invalid password" });
    }

    const accessToken = jwt.sign({ adminId: admin._id, email: admin.email }, process.env.ACCESS_TOKEN_SECRET, {
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
        admin: req.user,
     });
}

const getTimes = async (req, res) => {
    const { academicYear, semester } = req.query;

    try {
        const session = await Session.findOne({ academicYear, semester });

        if (!session) {
            return res.json({ error: true, message: "No session found for the provided academic year and semester." });
        }

        res.status(200).json({
            times: session.times,
        });
    } catch (error) {
        // Handle any errors
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

const getClassesBatches = async (req, res) => {
    const { academicYear, semester } = req.query;
    // console.log(academicYear, semester);

    try {
        // Find the document in the ClassBatch model that matches the academicYear and semester
        const classBatch = await ClassBatch.findOne({ academicYear, semester });

        if (!classBatch) {
            return res.json({ error: true, message: "No class or batch found for the provided academic year and semester." });
        }

        // console.log(classBatch.classes);

        // Return the classes and batches arrays
        res.status(200).json({
            classes: classBatch.classes,
            batches: classBatch.batches
        });
    } catch (error) {
        // Handle any errors
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    validateAdmin,
    validate,
    createClassBatch,
    getClassesBatches,
    createTimeTable,
    createSession,
    getTimes
}