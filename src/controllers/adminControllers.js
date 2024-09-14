// const Timetable = require("../model/AdminTimeTableModel")
const ClassBatch = require("../model/AdminClassBatchModel")
const Timetable = require("../model/AdminTimeTableModel")
const Admin = require("../model/AdminModel")
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')

require('dotenv').config();

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
        const {academicYear, semester, day, selectedClass, sessions} = req.body;

        let timetable = await Timetable.findOne({
            academicYear,
            semester,
            class: selectedClass
        });

        if (timetable) {
            // If timetable exists, check if the day already exists in the timetable
            let existingDay = timetable.days.find(d => d.day === day);
            if (existingDay) {
                // If the day exists, append the new sessions to the existing day
                existingDay.sessions.push(...sessions);
            } else {
                // If the day does not exist, add a new day with sessions
                timetable.days.push({ day, sessions });
            }

            await timetable.save();

            res.status(200).json({
                message: "Timetable updated successfully with new sessions",
                timetable
            });
        } else{
            const newTimetable = new Timetable({
                academicYear,
                semester,
                class: selectedClass,
                days: [{ day, sessions}]
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
        expiresIn: "30m",
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
    createTimeTable
}