const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
    origin: 'https://edutrackfrontend.onrender.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// Apply CORS globally
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests

async function main() {
    await mongoose.connect(process.env.CONNECTION_STRING, {
        serverSelectionTimeoutMS: 10000,
    });
}

main()
    .then(() => console.log("Mongodb connected successfully!"))
    .catch(err => console.log(err));

app.get("/", (req, res) => {
    res.send("edu-track-uvpce app server is running...");
});

const AdminRoutes = require('./src/routes/adminRoutes');
const StudentRoutes = require('./src/routes/studentRoutes');
const FacultyRoutes = require('./src/routes/facultyRoutes');

app.use('/admin', AdminRoutes);
app.use('/', StudentRoutes);
app.use("/faculty", FacultyRoutes);

app.listen(port, () => {
    console.log(`EduTrack listening on port ${port}`);
});
