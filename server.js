const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Database connection
const db = mysql.createConnection({
  host: 'localhost', // Change as needed
  user: 'root', // Your MySQL username
  password: '', // Your MySQL password
  database: 'dbyx4gtobgeyew' // Your database name
});

// Connect to MySQL
db.connect(err => {
  if (err) throw err;
  console.log('Connected to the database!');
});

// Middleware
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from 'public' folder

// API route to handle user queries
app.post('/ask', (req, res) => {
  const { question } = req.body;

  if (question.toLowerCase() === 'show students by campus') {
    // Query to show students by campus
    db.query('SELECT campus, COUNT(*) AS studentCount FROM users GROUP BY campus', (err, result) => {
      if (err) {
        res.status(500).send('Database error');
        return;
      }
      const campusData = result.map(row => `Campus: ${row.campus}, Students: ${row.studentCount}`).join(', ');
      res.json({ answer: `The students by campus are: ${campusData}` });
    });
  } else if (question.toLowerCase() === 'show fees by campus') {
    // Query to show total fees and monthly fees by campus
    db.query('SELECT campus, SUM(total_fees) AS totalFees, SUM(monthly_fee) AS totalMonthlyFee FROM users GROUP BY campus', (err, result) => {
      if (err) {
        res.status(500).send('Database error');
        return;
      }
      const campusFees = result.map(row => `Campus: ${row.campus}, Total Fees: ${row.totalFees}, Total Monthly Fee: ${row.totalMonthlyFee}`).join(', ');
      res.json({ answer: `The fees by campus are: ${campusFees}` });
    });
  } else if (question.toLowerCase() === 'show all monthly fees') {
    // Query to show all monthly fees
    db.query('SELECT name, monthly_fee FROM users', (err, result) => {
      if (err) {
        res.status(500).send('Database error');
        return;
      }
      const allMonthlyFees = result.map(row => `Student: ${row.name}, Monthly Fee: ${row.monthly_fee}`).join(', ');
      res.json({ answer: `The monthly fees for all students are: ${allMonthlyFees}` });
    });
  } else if (question.toLowerCase() === 'show total monthly fee') {
    // Query to calculate the total of monthly fees
    db.query('SELECT SUM(monthly_fee) AS totalMonthlyFee FROM users', (err, result) => {
      if (err) {
        res.status(500).send('Database error');
        return;
      }
      // Query to get total number of students
      db.query('SELECT COUNT(*) AS totalStudents FROM users', (err2, result2) => {
        if (err2) {
          res.status(500).send('Database error');
          return;
        }
        const totalMonthlyFee = result[0].totalMonthlyFee;
        const totalStudents = result2[0].totalStudents;
        res.json({ 
          answer: `The total monthly fee for all students is: ${totalMonthlyFee}, and the total number of students is: ${totalStudents}` 
        });
      });
    });
  } else if (question.toLowerCase().includes('how many students in')) {
    // Extract campus name from the question
    const campusName = question.split('how many students in ')[1].trim();

    // Query to count students in the specific campus
    db.query('SELECT COUNT(*) AS studentCount FROM users WHERE campus = ?', [campusName], (err, result) => {
      if (err) {
        res.status(500).send('Database error');
        return;
      }
      if (result.length > 0 && result[0].studentCount !== null) {
        res.json({ answer: `There are ${result[0].studentCount} students in the ${campusName} campus.` });
      } else {
        res.json({ answer: `No students found for the ${campusName} campus.` });
      }
    });
  } else {
    // Default response for undefined questions
    res.json({ answer: 'I cannot answer that question.' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
