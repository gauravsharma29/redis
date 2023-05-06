const express = require("express");
const redis = require("redis");
const axios = require("axios");

const client = redis.createClient("redis://localhost:6379");
client.on("connect", () => {
  console.log("Connected to Redis12345");
});

client.on("error", (err) => {
  console.log(err.message);
});

client.on("ready", () => {
  console.log("Redis is ready");
});

client.on("end", () => {
  console.log("Redis connection ended");
});

process.on("SIGINT", () => {
  client.quit();
});

client.connect();

client.on("error", (err) => console.log("Redis Client Error", err));

const app = express();
app.use(express.json());

app.post("/", async (req, res) => {
  const { key, value } = req.body;
  const response = await client.set(key, value);
  res.json(response);
});

app.get("/", async (req, res) => {
  const { key } = req.body;
  const response = await client.get(key);
  //   if not found then return null
  res.json(response);
});

app.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  const cachedResponse = await client.get(String(id));
  if (cachedResponse) {
    res.json(JSON.parse(cachedResponse));
    return;
  }
  const response = await axios.get(`https://jsonplaceholder.typicode.com/posts/${id}`);
  client.set(id, JSON.stringify(response.data), { EX: 10, NX: true });
  res.json(response.data);
});

app.listen(8080, () => {
  console.log("Now listening on port 8080");
});

// Redis
// Add
// Get
// Delete { EX: 10, NX: true } Nx means it will reset the time if you request before 10 seconds
// Expiration { EX: 10, NX: true }
