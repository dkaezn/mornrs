const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Configure CORS
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

// --- ROUTE 1: BREVO (Newsletter) - FIXED VERSION ---
app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body;
  
  // Validate email
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Step 1: Try to create/update contact
    const createResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        listIds: [3],
        updateEnabled: true, // This tells Brevo to update if exists
        emailBlacklisted: false,
        smsBlacklisted: false
      })
    });

    const createData = await createResponse.json();
    
    // Step 2: Check if successful
    if (createResponse.ok) {
      console.log(`Successfully added/updated ${email} in list 3`);
      return res.status(200).json({ 
        success: true, 
        message: 'Successfully subscribed' 
      });
    }
    
    // Step 3: Handle specific error cases
    if (createData.code === 'duplicate_parameter') {
      // Contact exists but wasn't updated properly - try adding to list directly
      console.log(`Contact ${email} exists, attempting to add to list directly...`);
      
      // First, get the contact to find their ID
      const getResponse = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
        headers: {
          'api-key': process.env.BREVO_API_KEY
        }
      });
      
      if (getResponse.ok) {
        const contactData = await getResponse.json();
        const contactId = contactData.id || contactData.email;
        
        // Add existing contact to list
        const addToListResponse = await fetch(`https://api.brevo.com/v3/contacts/lists/3/contacts/add`, {
          method: 'POST',
          headers: {
            'api-key': process.env.BREVO_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            emails: [email]
          })
        });
        
        if (addToListResponse.ok) {
          return res.status(200).json({ 
            success: true, 
            message: 'Added to newsletter list' 
          });
        }
      }
    }
    
    // If we get here, something else went wrong
    console.error('Brevo API error:', createData);
    res.status(createResponse.status).json({ 
      error: 'Failed to subscribe', 
      details: createData 
    });
    
  } catch (error) {
    console.error('Brevo Error:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// --- ROUTE 2: AIRTABLE (Join Form) ---
app.post('/api/join', async (req, res) => {
  const { name, email, goal, pace } = req.body;
  
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

// --- ROUTE 3: GET MEMBERS (For the Members Page) ---
app.get('/api/members', async (req, res) => {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME;

  try {
    // Removed the "Grid view" filter to prevent 404/422 errors if view name differs
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      // Return records or empty array if none exist
      res.status(200).json(data.records || []);
    } else {
      res.status(response.status).json(data);
    }
  } catch (error) {
    console.error('Airtable Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend is live on port ${PORT}`);
});