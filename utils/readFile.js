const { Storage } = require('@google-cloud/storage');

// Create a client to interact with the GCS API
const storage = new Storage();

async function listFiles(bucketName, folderPath = '') {
  try {
    // List all the files and folders in the bucket with the given prefix (folderPath)
    const [files] = await storage.bucket(bucketName).getFiles({
      prefix: folderPath,
    });

    // Iterate through the files and folders
    for (const file of files) {
      console.log(file.name);
    }
  } catch (err) {
    console.error('Error listing files:', err);
  }
}

// Example usage
const bucketName = 'front-end-audio-storage-awarri';
listFiles(bucketName);
