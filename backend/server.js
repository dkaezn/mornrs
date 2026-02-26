const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configure CORS for your live domain and local testing
app.use(cors({
  origin: [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'https://mornrs.com',
    'https://www.mornrs.com'
  ],
  credentials: true
}));

app.use(express.json());

// --- ROUTE 1: BREVO (Newsletter) ---
app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body;
  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY, // Uses key from Render Env
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        listIds: [3],
        updateEnabled: true
      })
    });

    const data = await response.json();
    if (response.ok) {
      res.status(200).json({ success: true });
    } else {
      res.status(response.status).json(data);
    }
  } catch (error) {
    console.error('Brevo Error:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// --- ROUTE 2: AIRTABLE (Join Form) ---
app.post('/api/join', async (req, res) => {
  const { name, email, goal, pace } = req.body;
  
  // Use the exact names you set in Render Env
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME;

  try {
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          'Name': name,
          'Email': email,
          'Goal': goal,
          'Pace': pace
        }
      })
    });

    const data = await response.json();
    if (response.ok) {
      res.status(200).json({ success: true });
    } else {
      res.status(response.status).json(data);
    }
  } catch (error) {
    console.error('Airtable Error:', error);
    res.status(500).json({ error: 'Failed to join club' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend is live on port ${PORT}`);
});