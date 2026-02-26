// script.js – Clean, optimized, frontend‑only
(function () {

  // ====================
  // MOBILE MENU
  // ====================
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // ====================
  // FOOTER YEAR
  // ====================
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }


const newsletterForm = document.getElementById('newsletter-form');

if (newsletterForm) {
  const emailInput = document.getElementById('newsletter-email');
  const msg = newsletterForm.querySelector('.form-msg');

  newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate email
    if (!emailInput.value || !emailInput.checkValidity()) {
      msg.textContent = 'Зөв имэйл хаяг оруулна уу.';
      msg.style.color = '#ff4444';
      return;
    }

    // Show "subscribing" message
    msg.textContent = 'Бүртгэж байна...';
    msg.style.color = '#666';

    try {
      // Call your backend server (running on port 3001)
      const response = await fetch('https://mornrs-backend.onrender.com/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailInput.value
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Email added to Brevo
        msg.textContent = 'Амжилттай бүртгэгдлээ! Mornrs-д тавтай морил.';
        msg.style.color = '#4CAF50';
        emailInput.value = '';
      } else {
        // Handle specific error cases
        if (data.alreadyExists) {
          msg.textContent = 'Энэ имэйл хаяг аль хэдийн бүртгэгдсэн байна!';
          msg.style.color = '#ffa500'; // Orange for already subscribed
        } else {
          msg.textContent = data.error || 'Бүртгэл амжилтгүй боллоо';
          msg.style.color = '#ff4444';
        }
      }
    } catch (error) {
      console.error('Error:', error);
      msg.textContent = 'Алдаа гарлаа. Дахин оролдоно уу.';
      msg.style.color = '#ff4444';
    }
  });
}

 // ====================
// JOIN FORM → Airtable
// ====================
const joinForm = document.getElementById('join-form');

if (joinForm) {
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const goalInput = document.getElementById('goal');
  const paceInput = document.getElementById('pace');
  const msg = joinForm.querySelector('.form-msg');

  // YOUR AIRTABLE CREDENTIALS
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN; 
  const BASE_ID = 'appzBiMt8XX5KcxQO';
  const TABLE_NAME = 'Members';

  joinForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const valid =
      nameInput.value.trim() &&
      emailInput.value.trim() &&
      emailInput.checkValidity() &&
      goalInput.value.trim();

    if (!valid) {
      msg.textContent = 'Заавал бөглөх талбаруудыг үнэн зөв бөглөнө үү.';
      msg.style.color = '#ff4444';
      return;
    }

    const newMember = {
      fields: {
        Name: nameInput.value.trim(),
        Email: emailInput.value.trim(),
        Goal: goalInput.value.trim(),
        Pace: paceInput.value.trim() || ''
      }
    };

    try {
      console.log('Sending to Airtable:', {
        token: AIRTABLE_TOKEN.substring(0, 15) + '...',
        baseId: BASE_ID,
        tableName: TABLE_NAME,
        data: newMember
      });

      const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMember)
      });

      console.log('Response status:', response.status);
      
      // Get the response as text first
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (response.ok) {
        // If response is OK, try to parse it (but we don't really need it)
        try {
          JSON.parse(responseText);
        } catch {
          // Ignore parsing errors for success case
        }
        
        msg.textContent = 'Mornrs клубт нэгдсэнд баярлалаа! Та одоо гишүүдийн жагсаалтад бүртгэгдлээ.';
        msg.style.color = '#4CAF50';
        joinForm.reset();
      } else {
        // Try to parse error as JSON, but handle non-JSON responses
        let errorMessage = 'Unknown error';
        let errorDetails = '';
        
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error?.message || errorData.error || JSON.stringify(errorData);
          errorDetails = JSON.stringify(errorData, null, 2);
        } catch {
          // If not JSON, use the text directly
          errorMessage = responseText || `HTTP error ${response.status}`;
        }
        
        // Show user-friendly message
        msg.textContent = `Алдаа: ${errorMessage.substring(0, 100)}${errorMessage.length > 100 ? '...' : ''}`;
        msg.style.color = '#ff4444';
        
        // Log full details to console
        console.error('=== AIRTABLE ERROR DETAILS ===');
        console.error('Status:', response.status);
        console.error('Status Text:', response.statusText);
        console.error('Error Message:', errorMessage);
        if (errorDetails) console.error('Full Error:', errorDetails);
        console.error('==============================');
        
        // Specific guidance based on status
        if (response.status === 401 || response.status === 403) {
          console.error('🔑 AUTHENTICATION ERROR: Your token is invalid or missing permissions');
          console.error('   Make sure your token has these scopes:');
          console.error('   - data.records:read');
          console.error('   - data.records:write');
        } else if (response.status === 404) {
          console.error('🔍 NOT FOUND: Check your BASE_ID and TABLE_NAME');
          console.error(`   Base ID: ${BASE_ID}`);
          console.error(`   Table Name: ${TABLE_NAME}`);
        } else if (response.status === 422) {
          console.error('📋 VALIDATION ERROR: Check your field names match Airtable');
          console.error('   Required fields: Name, Email, Goal, Pace');
        }
      }
    } catch (error) {
      console.error('=== NETWORK/FETCH ERROR ===');
      console.error('Error:', error);
      console.error('===========================');
      
      msg.textContent = `Алдаа: ${error.message}`;
      msg.style.color = '#ff4444';
    }
  });
}


// ====================
// MEMBERS PAGE - Fetch from Airtable
// ====================
const membersList = document.getElementById('members-list');

if (membersList) {
  // YOUR AIRTABLE CREDENTIALS
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN; 
  const BASE_ID = 'appzBiMt8XX5KcxQO';
  const TABLE_NAME = 'Members';

  async function loadMembers() {
    try {
      console.log('Fetching members from Airtable...');
      
      const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`
        }
      });
      
      console.log('Members response status:', response.status);
      
      const responseText = await response.text();
      
      if (!response.ok) {
        console.error('Error response:', responseText);
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = JSON.parse(responseText);
      console.log('Members data received:', data);
      
      const members = data.records.map(record => ({
        name: record.fields.Name,
        email: record.fields.Email,
        goal: record.fields.Goal,
        pace: record.fields.Pace || ''
      }));

      if (!members.length) {
        membersList.innerHTML = `
          <li class="member-meta">No members yet. Be the first to join!</li>
        `;
      } else {
        membersList.innerHTML = members
          .map(
            (m) => `
            <li>
              <span class="member-name">${m.name}</span>
              <span class="member-meta">
                ${m.goal}${m.pace ? ' · ' + m.pace + ' min/km' : ''}
              </span>
            </li>`
          )
          .join('');
      }
    } catch (error) {
      console.error('Error loading members:', error);
      membersList.innerHTML = `
        <li class="member-meta">Error loading members. Please refresh.</li>
      `;
    }
  }

  loadMembers();
}

  // ====================
  // EVENT FILTERS
  // ====================
  const chips = document.querySelectorAll('.chip');
  const events = document.querySelectorAll('.event');

  if (chips.length && events.length) {
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');

        const filter = chip.dataset.filter;

        events.forEach((ev) => {
          ev.style.display =
            filter === 'all' || ev.dataset.type === filter ? '' : 'none';
        });
      });
    });
  }

  console.log('Frontend-only script loaded');

})();
