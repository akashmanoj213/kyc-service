const { verifyDoc } = require('../utils/clients/digioClient');
const { getFileAsBuffer } = require('../utils/clients/storageClient');
const { uploadFile } = require('../utils/clients/documentUpload');
const { publishMessage } = require('../utils/clients/pubSubClient');
const config = require('config');

const { logger } = require("../utils/logger");

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

const verifyUpload = async (fileBuffer, fileName, customerId) => {
    //Verification
    const result = await verifyDoc(fileBuffer);

    if (!result.verified) {
        const data = {
            customerId,
            isVerified: false
        };
        await publishResult(data);

        return null;
    }

    //Upload
    try {
        const uploadResult = await uploadFile(fileBuffer, fileName, customerId)
        logger.info({ uploadResult }, "Document upload successfull");
    } catch (err) {
        logger.error(err, "Document upload failed. Proceeding without upload...")
    }

    const data = {
        customerId,
        isVerified: true
    };
    await publishResult(data);

    return result;
}

const publishResult = async (data) => {
    const PAYMENT_TOPIC = config.get("processUserTopic");
    await publishMessage(data, PAYMENT_TOPIC);
}

module.exports = {
    verifyKyc,
    verifyUpload
}