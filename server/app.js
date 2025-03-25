import {
  FingerprintJsServerApiClient,
  Region,
} from "@fingerprintjs/fingerprintjs-pro-server-api";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

const app = express();
const port = process.env.PORT || 3001;

dotenv.config();
app.use(express.json());
app.use(
  cors({
    origin: "https://prototype-client.onrender.com",
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

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
