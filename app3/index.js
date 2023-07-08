const { Kafka, Partitioners } = require("kafkajs");
require("dotenv").config();

const kafka = new Kafka({
  clientId: "my-app",
  brokers: [process.env.KAFKA_BROKER],
});

const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
});

const consumer = kafka.consumer({ groupId: "my-group" });

const runProducer = async () => {
  await producer.connect();
  await producer.send({
    topic: "my-topic",
    messages: [{ value: "Hello, Kafka!" }],
  });
  await producer.disconnect();
};

const runConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: "my-topic", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        topic,
        partition,
        offset: message.offset,
        value: message.value.toString(),
      });
    },
  });
};

const run = async () => {
  await runProducer();
  await runConsumer();
};

run().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
