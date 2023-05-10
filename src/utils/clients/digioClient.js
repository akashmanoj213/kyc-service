const axios = require('axios').default;
var FormData = require('form-data');
const { logger } = require("../../utils/logger");
const { post } = require("./axiosClient");

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
        const { id_attributes, id_type } = extractedData;

        if (Object.keys(id_attributes).length === 0) {
            logger.error("Digio verified successfully yet did not return data.");

            return {
                verified: false,
                data: {
                    message: "Invalid document. Please upload valid KYC document!"
                }
            };
        }

        return {
            verified: true,
            data: {
                id_type,
                ...id_attributes
            }
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

const verifyPanNumber = async (panNumber, fullName, dob) => {
    try {
        const token = createToken(clientId, clientSecret);
        const config = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${token}`
            }
        };

        const data = {
            pan_no: panNumber,
            full_name: fullName,
            date_of_birth: dob
        };

        const result = await post("https://ext.digio.in:444/v3/client/kyc/pan/verify", data, config);

        logger.info("result:", result.data);

        const { is_pan_dob_valid, name_matched } = result.data;

        const verified = is_pan_dob_valid && name_matched;

        return {
            verified,
            data: {
                isDobValid: is_pan_dob_valid,
                isNameValid: name_matched
            }
        };

    } catch (err) {
        logger.error(err, "Error occured while sending request to Digio!");
        throw err;
    }
}

const createToken = (clientId, clientSecret) => {
    const tokenBuffer = Buffer.from(`${clientId}:${clientSecret}`);
    return tokenBuffer.toString('base64');
}

module.exports = {
    verifyDoc,
    verifyPanNumber
}