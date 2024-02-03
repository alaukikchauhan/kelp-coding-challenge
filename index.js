const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const { Pool } = require('pg');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

// Multer middleware to handle file uploads
const uploadPath = process.env.CSV_UPLOAD_PATH;
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// API endpoint to handle CSV file upload
app.post('/convertCSV', upload.single('csvFile'), (req, res) => {
    try {
        const { buffer } = req.file;
        const rows = [];

        fs.writeFileSync(`${uploadPath}/temp.csv`, buffer);

        fs.createReadStream(`${uploadPath}/temp.csv`)
            .pipe(csvParser())
            .on('data', (row) => {
                rows.push(row);
            })
            .on('end', async () => {
                // Process rows and upload to PostgreSQL
                await processAndUploadToDB(rows);
                res.status(200).send('File uploaded successfully');
            });
    }
    catch (error) {
        res.status(500).json({ error: 'Error converting CSV to JSON' });
        console.error('API is failed due to error, more details', JSON.stringify(error));
    }

});

const processAndUploadToDB = async (rows) => {
    const client = await pool.connect();

    try {
        for (const row of rows) {
            const { firstName, lastName, age, ...rest } = row;
            const name = `${firstName} ${lastName}`;
            const additionalInfo = JSON.stringify(rest);

            const query = {
                text:
                    'INSERT INTO public.users(name, age, additional_info) VALUES($1, $2, $3) RETURNING id',
                values: [name, age, additionalInfo],
            };

            const result = await client.query(query);
            const userId = result.rows[0].id;
            console.log(`User with ID ${userId} inserted into the database.`);
        }
    } catch (error) {
        console.error('Error processing and uploading to DB:', error);
    } finally {
        client.release();
    }
};

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});