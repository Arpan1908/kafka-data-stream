const { Kafka } = require('kafkajs');
const kafkaConfig = require('../config/kafkaConfig');

const kafka = new Kafka({
  clientId: kafkaConfig.clientId,
  brokers: kafkaConfig.brokers
});

const producer = kafka.producer();

async function startKafkaProducer(audioChunk) {
  try {
    await producer.connect();
    await producer.send({
      topic: kafkaConfig.topic,
      messages: [
        { value: JSON.stringify(audioChunk) },
      ],
    });
  } catch (error) {
    console.error('Error in Kafka producer:', error);
  }
}

module.exports = { startKafkaProducer };