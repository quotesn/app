const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// POST endpoint for quote submissions
app.post('/api/submit-quote', (req, res) => {
  const { text, author } = req.body;
  if (!text) return res.status(400).json({ error: "Quote text required" });

  // Save to a local file (quotes_submitted.json)
  const submission = { text, author, date: new Date().toISOString() };
  const file = './quotes_submitted.json';
  let quotes = [];
  if (fs.existsSync(file)) {
    quotes = JSON.parse(fs.readFileSync(file));
  }
  quotes.push(submission);
  fs.writeFileSync(file, JSON.stringify(quotes, null, 2));

  // Optionally: send notification/email here

  res.json({ status: 'ok', saved: submission });
});

app.listen(PORT, () => {
  console.log(`Quote backend running on port ${PORT}`);
});
