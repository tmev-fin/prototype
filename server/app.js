import { FingerprintJsServerApiClient, Region } from '@fingerprintjs/fingerprintjs-pro-server-api'
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

const client = new FingerprintJsServerApiClient({
  apiKey: process.env.PRIVATE_API_KEY,
  region: Region.Global,
})

app.post('/', (req, res) => {
  const requestId = req.body.requestId;

  client.getEvent(requestId).then((data) => { 
    const event = JSON.stringify(data, null, 2);
    res.json(event);
  })
});

app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}`);
});