const { verifyDoc } = require('../services/digioClient');
const { getFileAsBuffer, uploadFile } = require('../services/storageClient');
const { logger } = require("../api/middlewares/logger");

const verifyKyc = async (fileName) => {
    try {
        const fileBuffer = await getFileAsBuffer(fileName);

        const result = await verifyDoc(fileBuffer);

        logger.info(`Verification result : ${result.verified}`)

        return result;
    } catch (err) {
        logger.error("Error occured during KYC verification :", err.message);
        throw err;
    }
}

const uploadVerify = async (fileBuffer, fileType) => {
    return new Promise((res, rej) => {
        Promise.allSettled([uploadFile(fileBuffer, fileType), verifyDoc(fileBuffer)]).then(results => {
            const [uploadResult, verifyDocResult] = results;

            if (verifyDocResult.status === 'rejected') {
                rej(`Verification failed with error - ${verifyDocResult.reason}. Please try again`);
            } else {
                logger.info("Verification succesffull");
            }

            if (uploadResult.status === 'rejected') {
                rej(`Document upload failed with error - ${uploadResult.reason}. Proceeding without upload...`);
            } else {
                logger.info("Upload succesffull", uploadResult.value);
            }

            const result = verifyDocResult.value;
            logger.info(`Verification result : ${result.verified}`)
            res(result);
        }).catch(err => rej(err));
    });
}

module.exports = {
    verifyKyc,
    uploadVerify
}