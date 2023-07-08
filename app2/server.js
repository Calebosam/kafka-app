const express = require("express");
const mongoose = require("mongoose");
const { Kafka, Partitioners } = require("kafkajs");
const dotenv = require("dotenv");
dotenv.config();

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
      console.log(`App2 Db connection successful`);
    })
    .catch((err) => console.log(err));
};

dbConfig();

const kafka = new Kafka({
  clientId: "my-app",
  brokers: [process.env.KAFKA_BROKER],
});
const consumer = kafka.consumer({ groupId: "my-group" });

// const runConsumer = async () => {
//   await consumer.connect();
//   await consumer.subscribe({ topic: "create-user", fromBeginning: true });

//   await consumer.run({
//     eachMessage: async ({ topic, partition, message }) => {
//       console.log({
//         topic,
//         partition,
//         offset: message.offset,
//         value: message.value.toString(),
//       });
//     },
//   });
// };

app.get("/", (req, res, next) => {
  res.json({ status: "success", message: "App2 is working" });
});

app.get("/users", async (req, res, next) => {
  const users = await User.find({});
  res.json({ status: "success", users });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
