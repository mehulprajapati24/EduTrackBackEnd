const express = require("express");
const router = express.Router();

const adminControllers = require("../controllers/adminControllers");
const { authenticateToken } = require("../../utilities");


router.post("/create-class-batch", adminControllers.createClassBatch);
router.post("/login", adminControllers.validateAdmin);
router.get("/validate", authenticateToken, adminControllers.validate);
router.get("/getclassesbatches", adminControllers.getClassesBatches);
router.get("/gettimes", adminControllers.getTimes);
router.post("/create-timetable", adminControllers.createTimeTable);
router.post("/create-session", adminControllers.createSession);

module.exports = router;