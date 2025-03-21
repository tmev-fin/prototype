import {
  FingerprintJsServerApiClient,
  Region,
} from '@fingerprintjs/fingerprintjs-pro-server-api'

const express = require('express');
const app = express();
const port = 3001;

const client = new FingerprintJsServerApiClient({
  apiKey: process.env.PRIVATE_API_KEY, // Replace with your key
  region: Region.Global, // Replace with your region
})

app.get('/', (req, res) => {
  // Get visit history of a specific visitor
  client.getVisits('VISITOR_ID').then((visitorHistory) => {
    const history = visitorHistory;
    res.send(`Well, hello there. Here's your visit history: ${history}`);
  });
});

app.post('/', (req, res) => {
  // grab req object to get the requestId from client
  const body = req.body.result;
  const requestId = body.requestId;

  console.log(`Request ID: ${requestId}`);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});