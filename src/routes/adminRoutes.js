const express = require("express");
const router = express.Router();

const adminControllers = require("../controllers/adminControllers");
const { authenticateToken } = require("../../utilities");


router.post("/create-class-batch", adminControllers.createClassBatch);
router.post("/login", adminControllers.validateAdmin);
router.get("/validate", authenticateToken, adminControllers.validate);
router.get("/getclasses", adminControllers.getClasses);
router.get("/getbatches", adminControllers.getBatches);
router.get("/gettimes", adminControllers.getTimes);
router.post("/create-timetable", adminControllers.createTimeTable);
router.post("/create-session", adminControllers.createSession);
router.post("/add-sheet-id", adminControllers.addSheetId);
router.get("/get-timetables-sheetname", adminControllers.getSheets);
router.get("/get-timetable-basedOnSheetName", adminControllers.getTimetableBasedOnSheetName);
router.get("/get-daywise-timetable", adminControllers.getDayWiseTimetable);
router.get("/get-timetable-based-on-time", adminControllers.getTimetableBasedOnTime);
router.get("/get-students-data", adminControllers.getStudentsData);
router.post("/get-student-location", adminControllers.getStudentLocation);
router.get("/get-faculty-data", adminControllers.getFacultyData);
router.post("/get-faculty-location", adminControllers.getFacultyLocation);
router.get("/get-room-data", adminControllers.getRoomData);

module.exports = router;