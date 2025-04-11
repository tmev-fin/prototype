import {
  FingerprintJsServerApiClient,
  Region,
  isValidWebhookSignature,
} from '@fingerprintjs/fingerprintjs-pro-server-api';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

const app = express();
const port = process.env.PORT || 3001;

dotenv.config();
app.use(express.json());

const allowedOrigins = [
  'https://prototype-client.onrender.com',
  'https://projectshowcase.dev',
  'projectshowcase.dev',
  'http://127.0.0.1:5500',
];

const users = [];

app.use(
  cors({
    origin: (origin, callback) => {
      allowedOrigins.includes(origin) || !origin
        ? callback(null, true)
        : callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
);

const client = new FingerprintJsServerApiClient({
  apiKey: process.env.PRIVATE_API_KEY,
  region: Region.Global,
});

app.get('/', (req, res) => {
  res.status(200).send('Well, hello there!');
});

app.get('/health', (req, res) => {
  res.status(200).send('Healthy!');
});

app.post('/', (req, res) => {
  const requestId = req.body.requestId;

  client.getEvent(requestId).then((data) => {
    const event = JSON.stringify(data, null, 2);
    res.json(event);
  });
});

app.post('/signin', async (req, res) => {
  const { email, password, visitorId } = req.body;
  const user = users.find((user) => user.email === email);

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const visitorIdExists = users.some((user) => user.visitorIds.includes(visitorId));

  if (!visitorIdExists) {
    return res.status(403).json({
      error: 'verification_required',
      message: 'MFA needed before completing signin',
    });
  }

  return completeSignIn(user, email, res);
});

app.post('/register', async (req, res) => {
  const { email, password, visitorId } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email & Password are required!' });
  }

  if (!visitorId) {
    return res.status(400).json({ message: 'Visitor ID is required!' });
  }

  const existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists!' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({
    email: email,
    password: hashedPassword,
    visitorIds: [visitorId],
  });

  const username = email.split('@')[0];
  const capitalizedUsername = username.charAt(0).toUpperCase() + username.slice(1);

  res.status(200).json({
    message: 'Successfully registered!',
    username: capitalizedUsername,
    visitorId: visitorId,
  });

  console.log('from /register', users);
});

app.post('/verify', async (req, res) => {
  const { email, visitorId, mfaCode } = req.body;
  const user = users.find((user) => user.email === email);
  console.log(mfaCode);

  // Simulate MFA verification
  if (mfaCode != 123456) {
    return res.status(401).json({ message: 'Invalid MFA code' });
  }

  if (!user.visitorIds.includes(visitorId)) {
    user.visitorIds.push(visitorId);
  }

  return completeSignIn(user, email, res);
});

app.post('/webhook', (req, res) => {
  (async () => {
    try {
      const secret = process.env.WEBHOOK_SIGNATURE_SECRET;
      const header = req.headers['fpjs-event-signature'];
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
      return res.status(200).json(`Webhook received! Here's your visitor ID: ${visitorId}`);
    } catch (error) {
      return res.status(500).json(`Error: ${error}`);
    }
  })();
});

async function completeSignIn(user, email, res) {
  const username = user.email.split('@')[0];
  const capitalizedUsername = username.charAt(0).toUpperCase() + username.slice(1);

  const visitorIds = users
    .filter((user) => user.email === email)
    .map((user) => user.visitorIds)
    .flat()
    .join(',\n');

  return res.status(200).json({
    message: 'Successfully signed in!',
    username: capitalizedUsername,
    visitorId: visitorIds,
  });
}

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
