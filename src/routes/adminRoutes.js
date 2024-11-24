const express = require("express");
const router = express.Router();

const adminControllers = require("../controllers/adminControllers");
const { authenticateToken } = require("../../utilities");


router.post("/create-class-batch", adminControllers.createClassBatch);
router.post("/addAdmin", adminControllers.addAdmin);
router.post("/addPrincipal", adminControllers.addPrincipal);
router.post("/selected-year", adminControllers.selectedYear);
router.post("/add-academicyear", adminControllers.addAcademicYear);
router.get("/academicyears", adminControllers.getYears);
router.post("/login", adminControllers.validateAdmin);
router.get("/validate", authenticateToken("admin"), adminControllers.validate);
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
router.post("/otp", adminControllers.otp);
router.post("/forgot-password/otp", adminControllers.validateOtpLogin);
router.post("/change-password", adminControllers.changePassword);
router.post("/manage-students", adminControllers.manageStudents);
router.post("/manage-faculties", adminControllers.manageFaculties);
router.post("/add-student", adminControllers.addStudent);
router.post("/add-faculty", adminControllers.addFaculty);
router.post("/add-timetable", adminControllers.addTimetable);
router.post("/delete-student", adminControllers.deleteStudent);
router.post("/delete-faculty", adminControllers.deleteFaculty);
router.post("/delete-timetable", adminControllers.deleteTimetable);
router.post("/get-student-for-update", adminControllers.getStudentForUpdate);
router.post("/get-faculty-for-update", adminControllers.getFacultyForUpdate);
router.post("/get-timetable-for-update", adminControllers.getTimetableForUpdate);
router.post("/update-student-with-data", adminControllers.updateStudentWithData);
router.post("/update-faculty-with-data", adminControllers.updateFacultyWithData);
router.post("/update-timetable-with-data", adminControllers.updateTimetableWithData);
router.post("/manage-timetables", adminControllers.manageTimetable)

module.exports = router;