const express = require("express");
const router = express.Router();



const adminControllers = require("../controllers/adminControllers");
const studentControllers = require("../controllers/studentControllers");
const { authenticateToken } = require("../../utilities");


router.get("/get-timetable", studentControllers.getTimetable);
router.post("/login", studentControllers.login);
router.post("/require", authenticateToken("student"), studentControllers.requireToChangePassword);
router.post("/updateProfileImage", authenticateToken("student"), studentControllers.updateProfileImage);
router.post("/otp", studentControllers.otp);
router.get("/getFaculties", studentControllers.getFaculties);
router.get("/getSchedule", authenticateToken("student"), studentControllers.getSchedule);
router.post("/forgot-password/otp", studentControllers.validateOtpLogin);
router.post("/change-password", studentControllers.changePassword);
router.get("/getProfile", authenticateToken("student"), studentControllers.getProfile);
router.get("/getStudentTimetable", authenticateToken("student"), studentControllers.getStudentTimetable);
router.get("/getStudentTimetableBasedOnDay", authenticateToken("student"), studentControllers.getStudentTimetableBasedOnDay);
router.get("/getStudentTimetableBasedOnTime", authenticateToken("student"), studentControllers.getStudentTimetableBasedOnTime);
router.get("/fetchProfile", authenticateToken("student"), studentControllers.fetchProfile);
module.exports = router;