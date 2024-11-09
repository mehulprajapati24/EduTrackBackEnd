require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyCI-RAeFWSe5L_2aClJKFzIkKhn8PJWd8o");

const students = [
    { name: "Alice", age: 21, major: "Computer Science", grade: "A" },
    { name: "Bob", age: 22, major: "Mathematics", grade: "B" },
    { name: "Charlie", age: 23, major: "Physics", grade: "A" },
    { name: "Diana", age: 20, major: "Biology", grade: "C" }
  ];
  
  // Format students array into a string to include in the prompt
//   const studentsData = students.map(student => 
//     `${student.name} is ${student.age} years old, studies ${student.major}, and has a grade of ${student.grade}.`
//   ).join(" ");

const studentsData = JSON.stringify(students, null, 2);

async function run(query) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
//   const prompt = `Here is some information about students: ${studentsData} Based on this information, ${query}`;
const prompt = `Here is some information about students in JSON format: ${studentsData}. Based on this information give me just direct answer not any explanation, ${query}`;    
const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(text);
}

run("how many students which have A grade?");