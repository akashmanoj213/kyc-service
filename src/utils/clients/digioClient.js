const axios = require('axios').default;
var FormData = require('form-data');
const { logger } = require("../../utils/logger");

const clientId = process.env.DIGIO_CLIENT_ID;
const clientSecret = process.env.DIGIO_CLIENT_SECRET;

const verifyDoc = async (front_part_buffer, back_part_buffer) => {
    const form = new FormData();
    form.append('front_part', front_part_buffer);
    form.append('should_verify', 'true');

    if (back_part_buffer) {
        form.append('back_part', back_part_buffer, 'document_back.jpeg');
    }

    const token = createToken(clientId, clientSecret);

    let extractedData;

    try {
        const result = await axios.post('https://ext.digio.in:444/v4/client/kyc/analyze/file/idcard', form, {
            headers: {
                "Content-Type": "multipart/form-data",
                "Authorization": `Basic ${token}`
            }
        });

        const { detections } = result.data;
        extractedData = detections[0];

        //Extract id_attributes
        const { id_attributes } = extractedData;
        return {
            verified: true,
            data: id_attributes
        };
    } catch (err) {
        if (err.code === "ERR_BAD_REQUEST") {
            const { response: { data } } = err;

            const message = data.message;

            logger.error(err, "Digio returned bad request error.", message);

            return {
                verified: false,
                data: {
                    message
                }
            };
        }

        logger.error(err, "Error occured while sending request to Digio!");
        throw err;
    }
}

const createToken = (clientId, clientSecret) => {
    const tokenBuffer = Buffer.from(`${clientId}:${clientSecret}`);
    return tokenBuffer.toString('base64');
}

module.exports = {
    verifyDoc
}