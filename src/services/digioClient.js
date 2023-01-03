const axios = require('axios').default;
var FormData = require('form-data');
const { logger } = require("../api/middlewares/logger");

const clientId = process.env.DIGIO_CLIENT_ID;
const clientSecret = process.env.DIGIO_CLIENT_SECRET;

const verifyDoc = async (front_part_buffer, back_part_buffer) => {
    const form = new FormData();
    form.append('front_part', front_part_buffer);
    form.append('should_verify', 'true');

    if(back_part_buffer) {
        form.append('back_part', back_part_buffer, 'document_back.jpeg');
    }

    const token = createToken(clientId, clientSecret);

    const { data } = await axios.post('https://ext.digio.in:444/v3/client/kyc/analyze/file/idcard', form, {
        headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Basic ${token}`
        }
    });

    const { id_type, id_card_verification_response = {} } = data;
    const { verified } = id_card_verification_response;

    let verifyResult = false;

    if (id_type && (id_type === "AADHAAR" || verified)) {
        verifyResult = true;
    }

    return {
        verified: verifyResult,
        data
    }
}

const createToken = (clientId, clientSecret) => {
    const tokenBuffer = Buffer.from(`${clientId}:${clientSecret}`);
    return tokenBuffer.toString('base64');
}

module.exports = {
    verifyDoc
}