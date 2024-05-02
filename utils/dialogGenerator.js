const { google } = require('googleapis');
const mammoth = require('mammoth');
const dotenv = require("dotenv").config();

// Authenticate to Google Drive
const auth = new google.auth.GoogleAuth({
  keyFile: "./service.json",
  scopes: ['https://www.googleapis.com/auth/drive']
});
const drive = google.drive({ version: 'v3', auth });

async function main() {
  try {
    // List all files and folders in the "Generated Dialogues" folder and its subfolders
    const res = await drive.files.list({
      q: "'<GENERATED_DIALOGUES_FOLDER_ID>' in parents and trashed=false", // Replace <GENERATED_DIALOGUES_FOLDER_ID> with the actual ID of the "Generated Dialogues" folder
      fields: 'files(id, name, mimeType, parents)'
    });

    // Process each file or folder
    for (const item of res.data.files) {
      if (item.mimeType === 'application/vnd.google-apps.folder') {
        // If it's a folder, recursively read its contents
        await readFolderContents(item.id, item.name);
      } else {
        // If it's a file, read its content
        await readFileContent(item.id, item.name);
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

// Function to read contents of a folder recursively
async function readFolderContents(folderId, folderName) {
  try {
    // List all files and subfolders in the folder
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`, // Include only files and folders within this folder
      fields: 'files(id, name, mimeType, parents)'
    });

    // Process each file or folder
    for (const item of res.data.files) {
      if (item.mimeType === 'application/vnd.google-apps.folder') {
        // If it's a folder, recursively read its contents
        await readFolderContents(item.id, folderName + '/' + item.name);
      } else {
        // If it's a file, read its content
        await readFileContent(item.id, folderName + '/' + item.name);
      }
    }
  } catch (err) {
    console.error(`Error reading contents of folder ${folderName}:`, err);
  }
}

// Function to read content of a file
async function readFileContent(fileId, fileName) {
  try {
    // Download file content
    const response = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    // Convert docx to JSON
    const content = await convertDocxToJson(response.data);

    // Output content as JSON
    console.log(JSON.stringify({ name: fileName, content }));
  } catch (err) {
    console.error(`Error reading content of file ${fileName}:`, err);
  }
}

// Function to convert docx content to JSON
async function convertDocxToJson(docxStream) {
  try {
    // Convert docx to HTML
    const htmlResult = await mammoth.convertToHtml({ buffer: docxStream });

    // Extract content from HTML
    const content = htmlResult.value;

    return content;
  } catch (err) {
    console.error('Error converting docx to JSON:', err);
    return null;
  }
}

main();
