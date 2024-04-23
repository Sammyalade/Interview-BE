const fs = require('fs').promises;
const path = require('path');
const { Storage } = require('@google-cloud/storage');
const { respondsSender } = require('../middleWare/respondsHandler');
const { ResponseCode } = require('./responseCode');
require('dotenv').config();

const projectId = process.env.PROJECT_ID || 'development-416403';
const keyFilename = process.env.KEYFILENAME || './service.json';
const bucketName = process.env.BUCKET_NAME || 'front-end-audio-storage-awarri';

const storage = new Storage({
    projectId,
    keyFilename
});



async function uploadFile(bucketName, file,  fileOutputName, folderName) {
    
    try {
        const bucket = storage.bucket(bucketName);
        const destination = folderName ? `${folderName}/${fileOutputName}` : fileOutputName;

        // Check if the folder exists
        const [exists] = await bucket.file(folderName).exists();
        if (!exists) {
            // If the folder doesn't exist, create it
            await bucket.file(folderName).save('', { resumable: false });
        }

        const retValue = await bucket.upload(file, {
            destination
        });
        return retValue;
    } catch (error) {
        console.log("Error:", error);
        throw error;
    }
}


const fileNameGenerator = () => {
    // Get current date and time
    const currentTime = new Date();

    // Format the date and time
    const formattedTime = `${currentTime.getFullYear()}-${(currentTime.getMonth() + 1).toString().padStart(2, '0')}-${currentTime.getDate().toString().padStart(2, '0')}_${currentTime.getHours().toString().padStart(2, '0')}-${currentTime.getMinutes().toString().padStart(2, '0')}-${currentTime.getSeconds().toString().padStart(2, '0')}`;

    return `awarrilangeasecaptured_${formattedTime}`;
}

const uploadToGCS = async (req, res, next) => {

    const fileName = `${fileNameGenerator()}_${req.file.originalname}`;
    const tempFilePath = path.join(__dirname, '../temp', fileName);
    const {task}=req.body;
    if(!task){
     respondsSender(
            null,
            "please indicate task(record or speak) as part of your request",
            ResponseCode.badRequest,
            res
        );
    }
    //get the folder to save file
    const folderName= task;
    try {
        // Write the buffer to a temporary file
        await fs.writeFile(tempFilePath, req.file.buffer);

        // Upload the temporary file
        const retFile = await uploadFile(bucketName, tempFilePath, fileName, folderName);
        req.uploadedFileName = retFile; // Attach filename to request object

        // Delete the temporary file after upload
        await fs.unlink(tempFilePath);

        next();
    } catch (error) {
        console.error("Error:", error);
        next(error);
    }
};

module.exports = { uploadToGCS };
