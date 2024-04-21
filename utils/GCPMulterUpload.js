const express = require('express');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');


// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Google Cloud Storage configuration
const storageClient = new Storage({
  projectId: 'YOUR_PROJECT_ID',
  keyFilename: 'path_to_service_account_key.json', // Path to your service account key file
});

const bucketName = 'your_bucket_name';
const bucket = storageClient.bucket(bucketName);

// Route to handle file upload
app.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).send('No file uploaded.');
      return;
    }

    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream();

    blobStream.on('error', (err) => {
      next(err);
    });

    blobStream.on('finish', () => {
      res.status(200).send('File uploaded successfully.');
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    next(error);
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Internal Server Error');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
