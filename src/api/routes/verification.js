const express = require("express");
const { success, error } = require("./util");
const {
  verifyUpload,
  verifyPan,
  createKyc,
} = require("../../controllers/verification");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post("/kyc-upload", upload.single("front_part"), async (req, res) => {
  try {
    req.log.info("Kyc upload and verify initiated...");

    const file = req.file;
    const { customerId } = req.query;

    if (!file || !customerId) {
      return res
        .status(400)
        .json(
          success(
            res.statusCode,
            "Invalid request. customerId or file missing."
          )
        );
    }

    const result = await verifyUpload(
      file.buffer,
      file.originalname,
      customerId
    );

    if (!result.verified) {
      return res
        .status(400)
        .json(
          success(res.statusCode, `Verification failed: ${result.data.message}`)
        );
    }

    return res
      .status(200)
      .json(success(res.statusCode, "KYC verified successfully", result));
  } catch (err) {
    req.log.error(err, "Error occured in KYC upload and verify API");
    return res.status(500).json(error(res.statusCode, err.message));
  }
});

router.post("/pan", async (req, res) => {
  try {
    req.log.info("Pan number verification initiated...");

    const { panNumber, fullName, dob } = req.body;

    if (!panNumber || !fullName || !dob) {
      return res
        .status(400)
        .json(
          success(
            res.statusCode,
            "Invalid request. Please provide valid panNumber, fullName and dob."
          )
        );
    }

    const result = await verifyPan(panNumber, fullName, dob);

    if (!result.verified) {
      return res
        .status(400)
        .json(success(res.statusCode, `PAN Verification failed!`));
    }

    return res
      .status(200)
      .json(success(res.statusCode, "PAN verified successfully", result));
  } catch (err) {
    req.log.error(err, "Error occured in PAN verification API");
    return res.status(500).json(error(res.statusCode, err.message));
  }
});

router.post("/create-kyc", async (req, res) => {
  try {
    req.log.info("New KYC request initiated...");
    const { customer_identifier, customer_name, template_name } = req.body;

    if (!customer_identifier || !customer_name || !template_name) {
      return res
        .status(400)
        .json(
          success(
            res.statusCode,
            "Invalid request. Please provide valid details."
          )
        );
    }
    const result = await createKyc(req.body);
    return res
      .status(200)
      .json(success(res.statusCode, "KYC created successfully", result));
  } catch (err) {
    req.log.error(err, "Error occured in KYC creation");
    return res.status(500).json(error(res.statusCode, err.message));
  }
});

router.get("/get-server-ip", async (req, res) => {
  try {
    req.log.info("Request to get server IP initiated...");

    // Make a request to a third-party service that returns the caller's IP
    // Replace with the actual third-party API endpoint
    const response = await axios.get("https://api.ipify.org?format=json");
    const res = await axios.get("https://ifconfig.me/ip");

    if (response.status !== 200) {
      const message = `Failed to fetch server IP. Third-party API returned status: ${response.status}`;
      req.log.error(message);
      return res.status(500).json(error(res.statusCode, message));
    }

    const serverIp = response.data.ip;

    req.log.info(`Server IP: ${serverIp}`);
    return res
      .status(200)
      .json(
        success(res.statusCode, "Server IP fetched successfully", {
          serverIp,
          res: res.data,
        })
      );
  } catch (err) {
    req.log.error(err, "Error occurred while fetching server IP");
    return res
      .status(500)
      .json(error(res.statusCode, "Error fetching server IP"));
  }
});

module.exports = router;
