const { Storage } = require('@google-cloud/storage');

async function listFolders(bucketName) {
  const storage = new Storage();
  const bucket = storage.bucket(bucketName);

  const folders = new Set();

  // List all files in the bucket
  const [files] = await bucket.getFiles();

  files.forEach(file => {
    // Extract folder path from the file name
    const filePathComponents = file.name.split('/');
    if (filePathComponents.length > 1) {
      const folderPath = filePathComponents.slice(0, -1).join('/');
      folders.add(folderPath);
    }
  });

  return folders;
}

const bucketName = 'front-end-audio-storage-awarri'; // Replace with your actual bucket name
listFolders(bucketName)
  .then(folders => {
    console.log('Folders in the bucket:');
    folders.forEach(folder => console.log(folder));
  })
  .catch(err => {
    console.error('Error listing folders:', err);
  });
