const express = require('express');
const { success, error } = require('./util');
const { verifyUpload } = require("../../controllers/verification");
const multer = require('multer');

const storage = multer.memoryStorage()
const upload = multer({ storage })

const router = express.Router();

router.post('/kyc-upload', upload.single('front_part'), async (req, res) => {
    try {
        req.log.info("Kyc upload and verify initiated...");

        const file = req.file;
        const { customerId } = req.query;

        if (!file || !customerId) {
            return res.status(400).json(success(res.statusCode, "Invalid request. customerId or file missing."));
        }

        const result = await verifyUpload(file.buffer, file.originalname, customerId);

        if (!result.verified) {
            return res.status(400).json(success(res.statusCode, `Verification failed: ${result.data.message}`));
        }

        return res.status(200).json(success(res.statusCode, "KYC verified successfully", result));
    } catch (err) {
        req.log.error(err, "Error occured in KYC upload and verify API");
        return res.status(500).json(error(res.statusCode, err.message));
    }
});

router.get("/health1", (req, res) => res.send(200));

router.get("/startup", (req, res) => res.send(200));

module.exports = router;