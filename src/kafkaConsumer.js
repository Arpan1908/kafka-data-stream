const { Kafka } = require('kafkajs');
const kafkaConfig = require('../config/kafkaConfig');
const { transcribe } = require('./speechToText');
const { translate } = require('./translator');

const kafka = new Kafka({
  clientId: kafkaConfig.clientId,
  brokers: kafkaConfig.brokers
});

const consumer = kafka.consumer({ groupId: 'voice-to-text-group' });

async function startKafkaConsumer(io) {
  await consumer.connect();
  await consumer.subscribe({ topic: kafkaConfig.topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const audioChunk = JSON.parse(message.value.toString());
      const transcription = await transcribe(audioChunk);
      const translation = await translate(transcription);
      io.emit('translation', translation);
    },
  });
}

module.exports = { startKafkaConsumer };


// bin/kafka-topics.sh --create --topic audio-stream --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1