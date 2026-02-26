// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();



const app = express();

// Update CORS to allow your specific frontend URL
app.use(cors({
  origin: ['http://127.0.0.1:5500',
    'http://localhost:5500',
    'https://mornrs.com',
    'https://www.mornrs.com'  
  ],
  credentials: true,
  methods: ['POST', 'GET', 'OPTIONS']
}));

app.use(express.json());

app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body;
  
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const LIST_ID = 3;

  console.log('Received subscription request for:', email); // Debug log

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (!BREVO_API_KEY) {
    console.error('BREVO_API_KEY is missing!');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    console.log('Sending request to Brevo...'); // Debug log
    
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        listIds: [LIST_ID],
        updateEnabled: true,
        attributes: {
          SOURCE: 'Website Newsletter Form'
        }
      })
    });

    const data = await response.json();
    console.log('Brevo response status:', response.status); // Debug log
    
    if (response.ok) {
      res.status(200).json({ success: true, message: 'Subscribed successfully' });
    } else if (response.status === 400 && data.message?.includes('already')) {
      res.status(400).json({ error: 'Email already exists', alreadyExists: true });
    } else {
      res.status(response.status).json(data);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for: http://127.0.0.1:5500`);
});