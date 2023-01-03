const express = require('express');
const { success, error } = require('./util');
const { verifyKyc, uploadVerify } = require("../../controllers/verification");
const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage()
const upload = multer({ storage })

const router = express.Router();

router.post('/kyc', async (req, res) => {
    try {
        req.log.info("Kyc verification initiated...")
        const { fileName } = req.body;
        const result = await verifyKyc(fileName)
        res.status(200).json(success(res.statusCode, "KYC verified successfully", result));
    } catch (err) {
        req.log.error(err, "Error occured in KYC verification API");
        return res.status(500).json(error(res.statusCode, err.message));
    }
});

router.post('/kyc-upload', upload.single('front_part'), async (req, res) => {
    try {
        req.log.info("Kyc upoload and verify initiated...");

        const filetype = path.extname(req.file.originalname);

        if(!filetype) {
            throw new Error("Invalid file. filetype not supported.");
        }

        const result = await uploadVerify(req.file.buffer, filetype);

        res.status(200).json(success(res.statusCode, "KYC verified successfully", result));
    } catch (err) {
        req.log.error(err, "Error occured in KYC upload and verify API");
        return res.status(500).json(error(res.statusCode, err.message));
    }
});


module.exports = router;