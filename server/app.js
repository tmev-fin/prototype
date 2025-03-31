import { FingerprintJsServerApiClient, Region, isValidWebhookSignature } from "@fingerprintjs/fingerprintjs-pro-server-api";
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
  "projectshowcase.dev",
  "http://127.0.0.1:5500"
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
  (async () => {
    //console.log("Entire request object: ", req);
    console.log("Entire headers object: ", req.headers);
    console.log("Specific header: ", req.headers["fpjs-event-signature"]);
    try {
      const secret = process.env.WEBHOOK_SIGNATURE_SECRET
      const header = req.headers["fpjs-event-signature"];
      const data = JSON.stringify(req.body);
  
      if (!secret) {
        return res.status(500).json('Secret is not set.');
      }
  
      if (!header) {
        return res.status(400).json('fpjs-event-signature header not found.');
      }
  
      if (!isValidWebhookSignature({ header, data, secret })) {
        return res.status(403).json('Webhook signature is invalid.');
      }
  
      const visitorId = req.body.visitorId;
      return res.status(200).json(`Webhook received! Here's your visitor ID: ${(visitorId)}`);
    } catch (error) {
      return res.status(500).json(`Error: ${error}`);
    }
  })();
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
