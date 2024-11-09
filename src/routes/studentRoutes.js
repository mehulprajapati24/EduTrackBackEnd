const express = require("express");
const router = express.Router();



const adminControllers = require("../controllers/adminControllers");
const studentControllers = require("../controllers/studentControllers");
const { authenticateToken } = require("../../utilities");


router.get("/get-timetable", studentControllers.getTimetable);
router.post("/login", studentControllers.login);
router.post("/require", authenticateToken, studentControllers.requireToChangePassword);
router.post("/updateProfileImage", authenticateToken, studentControllers.updateProfileImage);
router.post("/otp", studentControllers.otp);
router.get("/getFaculties", studentControllers.getFaculties);
router.get("/getSchedule", authenticateToken, studentControllers.getSchedule);
router.post("/forgot-password/otp", studentControllers.validateOtpLogin);
router.post("/change-password", studentControllers.changePassword);
router.get("/getProfile", authenticateToken, studentControllers.getProfile);
router.get("/getStudentTimetable", authenticateToken, studentControllers.getStudentTimetable);
router.get("/getStudentTimetableBasedOnDay", authenticateToken, studentControllers.getStudentTimetableBasedOnDay);
router.get("/getStudentTimetableBasedOnTime", authenticateToken, studentControllers.getStudentTimetableBasedOnTime);
router.get("/fetchProfile", authenticateToken, studentControllers.fetchProfile);
module.exports = router;