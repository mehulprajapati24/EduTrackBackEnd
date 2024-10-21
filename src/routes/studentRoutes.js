const express = require("express");
const router = express.Router();



const adminControllers = require("../controllers/adminControllers");
const studentControllers = require("../controllers/studentControllers");
const { authenticateToken } = require("../../utilities");


router.get("/get-timetable", studentControllers.getTimetable);
router.post("/login", studentControllers.login);


module.exports = router;