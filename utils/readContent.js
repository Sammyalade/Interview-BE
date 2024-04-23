const { Storage } = require('@google-cloud/storage');

const storage = new Storage();
    const mammoth = require("mammoth");

async function main() {
  try {
    // List all files in the "Test Dialogue" folder and its subfolders
    const [files] = await storage.bucket('front-end-audio-storage-awarri').getFiles({
      prefix: 'Test Dialogue/', // Filter by folder path
    });

    const dialogues = [];

    // Process each file
    for (const file of files) {
      // Extract folder and file names
      const [_, ...pathArray] = await file.name.split('/');
      const folder = await pathArray?.slice(0, -1).join('/');
      const fileName = await pathArray?.slice(-1)[0];

      // Display folder and file names
      // console.log('Folder:', folder);
      // console.log('File:', fileName);

      // Read file content
      const content = await readFileContent(file);
      
      // Output content as JSON
        dialogues.push({ folder: folder || "", fileName: fileName || "", content: content || "" });
    }
  // console.log(JSON.stringify(dialogues));
    return dialogues; // Return the array of dialogues
  } catch (err) {
    console.error('Error:', err);
    return null;
  }
}

async function readFileContent(file) {
  try {
    // Download file content
    const [content] = await file.download();

    // Extract raw text from the file content
    const rawTextResult = await mammoth.extractRawText({ buffer: content });

    // Return the extracted raw text value
    return rawTextResult.value;
  } catch (err) {
    console.error('Error reading content of file:', err);
    return null;
  }
}

// Call the main function and await its result
async function fetchDialogues() {
  const dialogues = await main();
  console.log(dialogues.length);
  //while using a for loop, put all generated content in db
  dialogues.map((document, index)=>(
    console.log(`Document ${index} ${JSON.stringify(document)}`)
    // const readFile= JSON.stringify(document)
  ));
}

 fetchDialogues();
