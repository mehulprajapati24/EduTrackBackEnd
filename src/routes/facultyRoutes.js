const express = require("express");
const router = express.Router();

const adminControllers = require("../controllers/adminControllers");
const studentControllers = require("../controllers/studentControllers");
const facultyControllers = require("../controllers/facultyController");

const { authenticateToken } = require("../../utilities");


router.post("/login", facultyControllers.login);
router.post("/require", authenticateToken, facultyControllers.requireToChangePassword);
router.post("/otp", facultyControllers.otp);
router.post("/forgot-password/otp", facultyControllers.validateOtpLogin);
router.post("/change-password", facultyControllers.changePassword);
router.get("/getProfile", authenticateToken, facultyControllers.getProfile);
router.get("/getSchedule", authenticateToken, facultyControllers.getSchedule);
router.get("/getFacultyTimetable", authenticateToken, facultyControllers.getFacultyTimetable);
router.get("/getFacultyTimetableBasedOnDay", authenticateToken, facultyControllers.getFacultyTimetableBasedOnDay);
router.get("/getFacultyTimetableBasedOnTime", authenticateToken, facultyControllers.getFacultyTimetableBasedOnTime);
router.post("/startShift", authenticateToken, facultyControllers.startShift);
router.post("/endShift", authenticateToken, facultyControllers.endShift);
router.get("/get-fields", authenticateToken, facultyControllers.getFields);
router.get("/getShiftsOfFaculty", authenticateToken, facultyControllers.getShiftsOfFaculty);
router.post("/get-class-timetables-sheetname", facultyControllers.getClassSheets);
router.post("/get-location-based-on-class-selection", facultyControllers.getLocationBasedOnClassSelection);



module.exports = router;