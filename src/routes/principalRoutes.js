const express = require("express");
const router = express.Router();

const adminControllers = require("../controllers/adminControllers");
const principalControllers = require("../controllers/principalControllers");
const { authenticateToken } = require("../../utilities");


router.post("/create-class-batch", adminControllers.createClassBatch);
router.post("/addAdmin", adminControllers.addAdmin);
router.post("/addPrincipal", adminControllers.addPrincipal);
router.post("/selected-year", adminControllers.selectedYear);
router.post("/add-academicyear", adminControllers.addAcademicYear);
router.get("/academicyears", adminControllers.getYears);
router.post("/login", principalControllers.validatePrincipal);
router.get("/validate", authenticateToken, principalControllers.validate);
router.get("/getclasses", adminControllers.getClasses);
router.get("/getbatches", adminControllers.getBatches);
router.get("/gettimes", adminControllers.getTimes);
router.post("/create-timetable", adminControllers.createTimeTable);
router.post("/create-session", adminControllers.createSession);
router.post("/add-sheet-id", adminControllers.addSheetId);
router.get("/get-timetables-sheetname", adminControllers.getSheets);
router.post("/get-class-timetables-sheetname", adminControllers.getClassSheets);
router.post("/get-location-based-on-class-selection", adminControllers.getLocationBasedOnClassSelection);
router.post("/get-timetables-sheetname", adminControllers.postGetSheets);
router.get("/get-timetable-basedOnSheetName", adminControllers.getTimetableBasedOnSheetName);
router.post("/get-timetable-basedOnSheetName", adminControllers.postGetTimetableBasedOnSheetName);
router.get("/get-daywise-timetable", adminControllers.getDayWiseTimetable);
router.post("/get-daywise-timetable", adminControllers.postGetDayWiseTimetable)
router.get("/get-timetable-based-on-time", adminControllers.getTimetableBasedOnTime);
router.post("/get-timetable-based-on-time", adminControllers.postGetTimetableBasedOnTime);
router.get("/get-students-data", adminControllers.getStudentsData);
router.post("/get-students-data", adminControllers.postGetStudentsData);
router.post("/get-student-location", adminControllers.getStudentLocation);
router.post("/post-get-student-location", adminControllers.postGetStudentLocation);
router.get("/get-students-location", adminControllers.getStudentsLocation);
router.get("/get-faculty-data", adminControllers.getFacultyData);
router.post("/get-faculty-data", adminControllers.postGetFacultyData);
router.post("/get-faculty-location", adminControllers.getFacultyLocation);
router.get("/get-room-data", adminControllers.getRoomData);
router.post("/get-room-data", adminControllers.postGetRoomData);
router.get("/viewShifts", adminControllers.viewShifts);
router.post("/viewShifts", adminControllers.postViewShifts);
router.post("/get-student-location-based-on-prompt", adminControllers.getStudentLocationBasedOnPrompt);
router.post("/otp", principalControllers.otp);
router.post("/forgot-password/otp", principalControllers.validateOtpLogin);
router.post("/change-password", principalControllers.changePassword);

module.exports = router;