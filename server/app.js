import { FingerprintJsServerApiClient, Region } from "@fingerprintjs/fingerprintjs-pro-server-api";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

const app = express();
const port = process.env.PORT || 3001;

dotenv.config();
app.use(express.json());

const allowedOrigins = [
  "https://prototype-client.onrender.com",
  "https://projectshowcase.dev",
  "projectshowcase.dev"
];

app.use(
  cors({
    origin: (origin, callback) => {
      allowedOrigins.includes(origin) || !origin ? callback(null, true) : callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

const client = new FingerprintJsServerApiClient({
  apiKey: process.env.PRIVATE_API_KEY,
  region: Region.Global,
});

app.get("/", (req, res) => {
  res.status(200).send("Well, hello there!");
});

app.get("/health", (req, res) => {
  res.status(200).send("Healthy!");
});

app.post("/", (req, res) => {
  const requestId = req.body.requestId;

  client.getEvent(requestId).then((data) => {
    const event = JSON.stringify(data, null, 2);
    res.json(event);
  });
});

app.post("/webhook", (req, res) => {
  const visitorId = req.body.visitorId;
  res.status(200).send(`Webhook received! Here's your visitor ID: ${(visitorId)}`);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
