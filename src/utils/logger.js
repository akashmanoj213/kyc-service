const bunyan = require('bunyan');
const { LoggingBunyan,  LOGGING_TRACE_KEY } = require('@google-cloud/logging-bunyan');

// Creates a Bunyan Cloud Logging client
const loggingBunyan = new LoggingBunyan({
    serviceContext: {
        service: 'payment-service-1', // required to report logged errors
        // to the Google Cloud Error Reporting
        // console
        version: 'version-1'
    },
    defaultCallback: err => {
        if (err) {
            console.log('Error occured in logging: ' + err);
        }
    }
});

//Enable cloud logging only for production
const streams = process.env.NODE_ENV === "production" ? [loggingBunyan.stream('info')] : [{ level: 'debug', stream: process.stdout }];

const logger = bunyan.createLogger({
    // The JSON payload of the log as it appears in Cloud Logging
    // will contain "name": "payment_service"
    name: 'payment_service_0',
    serializers: bunyan.stdSerializers,
    streams,
});

module.exports = {
    logger,
    LOGGING_TRACE_KEY
}