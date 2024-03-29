const { PubSub } = require('@google-cloud/pubsub');
const { logger } = require('../../utils/logger');
const { getTraceId } = require('../traceId');

const publishMessage = async (data, topicName, attributes = {}) => {
    try {
        const pubSubClient = new PubSub();

        const strData = JSON.stringify(data);
        const dataBuffer = Buffer.from(strData);

        const traceId = getTraceId();

        attributes = {
            ...attributes,
            traceId
        }

        const messageId = await pubSubClient
            .topic(topicName)
            .publish(dataBuffer, attributes);

        logger.info(`Message ${messageId} published.`);
        return messageId;
    } catch (err) {
        logger.error(err, `Error occured while trying to publish message to topic ${topicName}!`);
        throw err;
    }
}

module.exports = {
    publishMessage
}