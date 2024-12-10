Edu-Track
Edu-Track is a web-based management system built with MERN stack (MongoDB, Express, React, Node.js) designed to address common challenges faced by educational institutions in managing their academic and administrative tasks efficiently.

Purpose of Edu-Track
Educational institutions often struggle with:

Inefficient management of student, faculty, and class schedules.
Manual processes for updating academic timetables and records.
Difficulty in tracking academic progress.
A lack of centralized systems to resource management.
To solve these problems, Edu-Track was developed as a comprehensive platform to automate, organize, and optimize these processes while ensuring ease of use and accessibility for all stakeholders.

Frontend:
React.js
Tailwind CSS

Backend:
Node.js
Express.js

Database:
MongoDB

Other Tools:
Figma (UI)
Axios (API Calls)
JWT (Authentication)
Uploadcare (Media Storage)
Gemini (Chatbot)

Installation and Setup

Step 1: Clone the Repository of Backend
git clone https://github.com/mehulprajapati24/EduTrackBackEnd.git
cd EduTrackBackEnd

Step 2: Install Dependencies
npm install

Step 3: Set Up Environment Variables
Create a .env file.
PORT=5000
CONNECTION_STRING=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_secret_token
EMAIL_USER=your_email_id
EMAIL_PASS=password_of_email_id or pass_key
UPLOAD_CARE_PUBLIC_KEY=your_upload_care_public_key
ACCESS_KEY=your_web3Forms_access_key
GOOGLE_PRIVATE_KEY=your_google_private_key
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_google_service_account_email
PASSWORD=default_password

Step 4: Run the Application
npm run start

Step 5: Clone the Repository of Frontend
git clone https://github.com/mehulprajapati24/EduTrackFrontEnd.git
cd EduTrackFrontEnd

Step 6: Install Dependencies
npm install

Step 7: Set Up Environment Variables
Create a .env file.
Add 
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_ACCESS_KEY=your_web3Forms_access_key

Step 8: Run the Application
npm run dev

Step 9: Access the Application
For student: http://localhost:5173
For Faculty: http://localhost:5173/faculty
For Principal: http://localhost:5173/principal
For Admin: http://localhost:5173/admin
