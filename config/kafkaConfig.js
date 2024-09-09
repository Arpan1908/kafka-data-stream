require('dotenv').config();

module.exports = {
  clientId: 'voice-to-text-app',
  brokers: [process.env.KAFKA_BROKER],
  topic: process.env.KAFKA_TOPIC
};