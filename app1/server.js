const express = require("express");
const mongoose = require("mongoose");
const { Kafka } = require("kafkajs");
const app = express();

app.use(express.json());

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

const dbConfig = async () => {
  await mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log(`App1 Db connection successful`);
    })
    .catch((err) => console.log(err));
};

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["kafka:9092"],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "test-group" });

const run = async () => {
  // Producing
  await producer.connect();
  await producer.send({
    topic: "test-topic",
    messages: [{ value: "Hello KafkaJS user!" }],
  });

  // Consuming
  await consumer.connect();
  await consumer.subscribe({ topic: "test-topic", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        partition,
        offset: message.offset,
        value: message.value.toString(),
      });
    },
  });
};

const dbsRunning = async () => {
  await dbConfig();
};
run().catch(console.error);
// setTimeout(dbsRunning, 1000);

app.get("/", (req, res, next) => {
  res.json({ status: "success", message: "App1 is working" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
