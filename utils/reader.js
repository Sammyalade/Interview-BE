const { Storage } = require("@google-cloud/storage");
const storage = new Storage();
const mammoth = require("mammoth");
const { BUCKET_FOLDER_NAME, BUCKET_NAME } = require("./constant");

async function main() {
  try {
    // List all files in the "Test Dialogue" folder and its subfolders
    const [files] = await storage.bucket(BUCKET_NAME).getFiles({
      prefix: BUCKET_FOLDER_NAME, // Filter by folder path
    });

    const dialogues = [];

    // Process each file
    for (const file of files) {
      // Extract folder and file names
      const pathArray = file.name.split("/");
      const folder = pathArray[1]; // The second element represents the parent folder
      const fileName = pathArray.slice(-1)[0];

      // Display folder and file names
      // console.log('Folder:', folder);
      // console.log('File:', fileName);

      // Read file content
      const content = await readFileContent(file);
      console.log(content);
      //here are each content, clean up and push to db appropoatly

      // Output content as JSON
      dialogues.push({
        folder: folder || "",
        fileName: fileName || "",
        content: content || "",
      });
    }

    console.log(dialogues);
    return dialogues; // Return the array of dialogues
  } catch (err) {
    console.error("Error:", err);
    return null;
  }
}

async function readFileContent(file) {
  try {
    // Download file content
    const [content] = await file.download();

    // Log the file name to understand which file is causing the issue
    console.log("Processing file:", file.name);

    // Check if the content is empty
    if (!content || content.length === 0) {
      console.error("Error: Empty content for file:", file.name);
      return null;
    }

    // Extract raw text from the file content
    const rawTextResult = await mammoth.extractRawText({ buffer: content });

    // Check if raw text extraction was successful
    if (!rawTextResult || !rawTextResult.value) {
      console.error("Error: No text extracted from file:", file.name);
      return null;
    }

    // Return the extracted raw text value
    return rawTextResult.value;
  } catch (err) {
    console.error("Error reading content of file:", err);
    return null;
  }
}

// Call the main function and await its result
async function fetchDialogues() {
  const dialogues = await main();
  console.log(JSON.stringify(dialogues[1]));

  //
}

fetchDialogues();
