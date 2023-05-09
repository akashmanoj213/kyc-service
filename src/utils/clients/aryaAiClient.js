const axios = require('axios').default;

const token = process.env.ARYA_AI_TOKEN;

const verifyDoc = async (base64Data, documentType, requestId ) => {
    const requestBody = {
        "doc_type": documentType,
        "req_id": requestId,
        "doc_base64": base64Data
    }

    const result = await axios.post('https://ping.arya.ai/api/v1/kyc', requestBody, {
        headers: {
            "Content-Type": "application/json",
            token
        }
    });
}

module.exports = {
    verifyDoc
}