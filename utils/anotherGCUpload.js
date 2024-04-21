const { Storage } = require('@google-cloud/storage');
require('dotenv').config();
const projectId='development-416403'   //process.env.PROJECT_ID
const keyFilename= './../service.json'  //process.env.KEYFILENAME
const bucketName='front-end-audio-storage-awarri'   //process.env.BUCKET_NAME

console.log(keyFilename);
const storage = new Storage({
            projectId,
            keyFilename
        });

async function uploadFile(bucketName, file, fileoutPutName) {
    try {
        
        const bucket = storage.bucket(bucketName);
        const retValue = await bucket.upload(file, {
            destination: fileoutPutName
        });
        return retValue;
    } catch (error) {
        console.log("Error:", error);
    }
}

(async () => {
    try {
        const retFile = await uploadFile('front-end-audio-storage-awarri', './text.txt', 'tfhsename.txt');
        console.log(retFile);
    } catch (error) {
        console.error("Error:", error);
    }
})();
