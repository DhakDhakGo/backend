const express = require('express');
const app = express();

// Use express.json() to automatically parse the Pub/Sub push request
app.use(express.json());

app.post('/', (req, res) => {
  if (!req.body) {
    const msg = 'no Pub/Sub message received';
    console.error(`error: ${msg}`);
    res.status(400).send(`Bad Request: ${msg}`);
    return;
  }

  if (!req.body.message) {
    const msg = 'invalid Pub/Sub message format';
    console.error(`error: ${msg}`);
    res.status(400).send(`Bad Request: ${msg}`);
    return;
  }

  // The actual data is Base64 encoded in the "data" field
  const pubSubMessage = req.body.message;
  const data = pubSubMessage.data
    ? Buffer.from(pubSubMessage.data, 'base64').toString().trim()
    : 'no data';

  console.log(`Received message: ${data}`);

  // Always return a 204 or 200 to acknowledge the message
  res.status(204).send();
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Subscriber listening on port ${PORT}`);
});