const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

async function main() {
    await mongoose.connect(process.env.CONNECTION_STRING, {
    serverSelectionTimeoutMS: 10000 // Timeout after 5 seconds instead of the default 30 seconds
});

}

main().then(()=> console.log("Mongodb connected successfully!")).catch(err=>console.log(err));

app.get("/", (req, res)=>{
    res.send("edu-track-uvpce app server is running...");
})

const AdminRoutes = require('./src/routes/adminRoutes')
const StudentRoutes = require('./src/routes/studentRoutes')

app.use('/admin', AdminRoutes);
app.use('/', StudentRoutes);

app.listen(port, ()=>{
    console.log(`EduTrack listening on port ${port}`);
})