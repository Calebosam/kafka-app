const express = require("express");
const mongoose = require("mongoose");
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

const dbsRunning = async () => {
  await dbConfig();
};

setTimeout(dbsRunning, 10000);

app.get("/", (req, res, next) => {
  res.json({ status: "success", message: "App2 is working" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
