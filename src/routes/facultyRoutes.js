const express = require("express");
const router = express.Router();

const adminControllers = require("../controllers/adminControllers");
const studentControllers = require("../controllers/studentControllers");
const facultyControllers = require("../controllers/facultyController");

const { authenticateToken } = require("../../utilities");


router.post("/login", facultyControllers.login);
router.post("/require", authenticateToken("faculty"), facultyControllers.requireToChangePassword);
router.post("/otp", facultyControllers.otp);
router.post("/forgot-password/otp", facultyControllers.validateOtpLogin);
router.post("/change-password", facultyControllers.changePassword);
router.get("/getProfile", authenticateToken("faculty"), facultyControllers.getProfile);
router.get("/getSchedule", authenticateToken("faculty"), facultyControllers.getSchedule);
router.get("/getFacultyTimetable", authenticateToken("faculty"), facultyControllers.getFacultyTimetable);
router.get("/getFacultyTimetableBasedOnDay", authenticateToken("faculty"), facultyControllers.getFacultyTimetableBasedOnDay);
router.get("/getFacultyTimetableBasedOnTime", authenticateToken("faculty"), facultyControllers.getFacultyTimetableBasedOnTime);
router.post("/startShift", authenticateToken("faculty"), facultyControllers.startShift);
router.post("/endShift", authenticateToken("faculty"), facultyControllers.endShift);
router.get("/get-fields", authenticateToken("faculty"), facultyControllers.getFields);
router.get("/getShiftsOfFaculty", authenticateToken("faculty"), facultyControllers.getShiftsOfFaculty);
router.post("/get-class-timetables-sheetname", facultyControllers.getClassSheets);
router.post("/get-location-based-on-class-selection", facultyControllers.getLocationBasedOnClassSelection);



module.exports = router;