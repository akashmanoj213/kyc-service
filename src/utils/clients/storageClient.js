const uuid = require("uuid");
const { Storage } = require('@google-cloud/storage');
const stream = require('stream');

const getFileAsBuffer = async (fileName) => {
    // Downloads the file into a buffer in memory.
    const contents = await myBucket.file(fileName).download();

    return contents[0];
}

const uploadFile = (fileBuffer, fileType, bucketName) => {
    const storage = new Storage();
    const myBucket = storage.bucket(bucketName);
    const destFileName = uuid.v4() + fileType;
    const file = myBucket.file(destFileName);

    // Create a pass through stream from a string
    const passthroughStream = new stream.PassThrough();
    passthroughStream.write(fileBuffer);
    passthroughStream.end();

    return new Promise((res, rej) => {
        passthroughStream.pipe(file.createWriteStream()).on('finish', (value) => {
            console.log(value);
            res("Upload succesffull for file: " + destFileName);
        });
    });
}

module.exports = {
    getFileAsBuffer,
    uploadFile
}