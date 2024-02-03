const express = require('express');
const multer = require('multer');
const csvtojson = require('csvtojson');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

// Multer middleware to handle file uploads
// const upload = multer({ dest: 'uploads/' });

// API endpoint to handle CSV file upload
app.post('/convertCSV', (req, res) => {
    try {
        console.log(req.body.file);
        if (!req.body.file) return res.status(400).json({ error: 'No file uploaded' });

        else {
            csvtojson()
            .fromFile(req.body.file.path)
            .then((jsonArrayObj) => {res.json(jsonArrayObj)})
            .catch((error) => {throw error});
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Error converting CSV to JSON' });
        console.log('API is failed due to error, more details', JSON.stringify(error));
    }

});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});