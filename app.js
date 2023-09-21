const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const fs = require('fs');
const nodemailer = require('nodemailer');
const app = express();
app.use(bodyParser.json());
// MySQL Database Configuration
const db = mysql.createConnection({
  host: 'localhost',        
  user: 'root',   
  password: 'root',
  database: 'basket',
});

var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "961064fb730a66",
      pass: "020689543f79de"
    }
  });


// Connect to MySQL
db.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      return;
    }
    console.log('Connected to MySQL database');

});

// api for send email
app.post('/send-email', (req, res) => {
    const { to, subject, text } = req.body;
    const tableName = 'employee';
    const query = `SELECT * FROM ${tableName}`;
  
    // Execute the query
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send('Database error');
      }
      const csvData = results.map((row) => Object.values(row).join(','));
      const csvContent = csvData.join('\n');
      const attachmentPath = 'data.csv';
      fs.writeFile(attachmentPath, csvContent, (fileErr) => {
            if (fileErr) {
                console.error('Error writing CSV file:', fileErr);
                return db.end(); // Close the database connection on error
            }
            const mailOptions = {
                from: 'neerajchaunkar@gmail.com',  
                to: to,                       
                subject: subject,             
                text: text,
                attachments: [
                    {
                        filename: 'data.csv',
                        path: attachmentPath,
                    },
                    ],
            };

            // Send email with attachment
            transport.sendMail(mailOptions, (emailErr, info) => {
                fs.unlinkSync(attachmentPath);
            if (emailErr) {
                console.error('Error sending email:', emailErr);
                return res.status(200).send('Email not sent:'+info.response);
            } else {
               
                console.log('Email sent:', info.response);
                return res.status(200).send("Email sent");
            }

            });
        });
    });

  });

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});