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
      console.log(`App1 Db connection successful`);
    })
    .catch((err) => console.log(err));
};
dbConfig();

const kafka = new Kafka({
  clientId: "my-app",
  brokers: [process.env.KAFKA_BROKER],
});

const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
});

const runProducer = async (topic, message) => {
  await producer.connect();
  await producer.send({
    topic: topic,
    messages: [{ value: JSON.stringify(message) }],
  });
  await producer.disconnect();
};

app.get("/", (req, res, next) => {
  res.json({ status: "success", message: "App1 is working" });
});
app.get("/users", async (req, res, next) => {
  const users = await User.find({});
  res.json({ status: "success", users });
});

app.post("/users", async (req, res, next) => {
  const user = await User.create(req.body);

  const run = async () => {
    await runProducer("create-user", user);
  };

  run()
    .then(() => {
      console.log("User Created");
      res.json({ status: "success", user });
    })
    .catch((error) => {
      console.error("Error:", error);
      res.json({ status: "fail", message: error });
    });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
