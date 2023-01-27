const { verifyDoc } = require('../utils/clients/digioClient');
const { uploadFile } = require('../utils/clients/documentUpload');
const { publishMessage } = require('../utils/clients/pubSubClient');
const config = require('config');

const { logger } = require("../utils/logger");

const verifyUpload = async (fileBuffer, fileName, customerId) => {
    //Verification
    const result = await verifyDoc(fileBuffer);

    if (!result.verified) {
        const data = {
            customerId,
            isVerified: false
        };
        await publishResult(data);

        return result;
    }

    //Upload
    try {
        const uploadResult = await uploadFile(fileBuffer, fileName, customerId);
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
    verifyUpload
}