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

  // ====================
  // NEWSLETTER FORM
  // ====================
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
        console.log('Sending email:', emailInput.value); // Debug log
        
        const response = await fetch('https://mornrs-backend.onrender.com/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: emailInput.value
          })
        });

        console.log('Response status:', response.status); // Debug log
        
        const data = await response.json();
        console.log('Response data:', data); // Debug log

        // Handle successful response
        if (response.ok) {
          msg.textContent = 'Амжилттай бүртгэгдлээ!';
          msg.style.color = '#4CAF50';
          emailInput.value = ''; // Clear input
        } else {
          msg.textContent = data.message || 'Алдаа гарлаа. Дахин оролдоно уу.';
          msg.style.color = '#ff4444';
        }
      } catch (error) {
        console.error('Full error details:', error); // This will show more details
        msg.textContent = 'Алдаа гарлаа. Дахин оролдоно уу.';
        msg.style.color = '#ff4444';
      }
    });
  }

 // ====================
// JOIN FORM → Send to Backend
// ====================
const joinForm = document.getElementById('join-form');

if (joinForm) {
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const goalInput = document.getElementById('goal');
  const paceInput = document.getElementById('pace');
  const msg = joinForm.querySelector('.form-msg');

  joinForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Basic Validation
    if (!nameInput.value.trim() || !emailInput.checkValidity()) {
      msg.textContent = 'Заавал бөглөх талбаруудыг үнэн зөв бөглөнө үү.';
      msg.style.color = '#ff4444';
      return;
    }

    msg.textContent = 'Илгээж байна...';
    msg.style.color = '#666';

    try {
      // 2. Send to YOUR backend (which has the keys)
      const response = await fetch('https://mornrs-backend.onrender.com/api/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          goal: goalInput.value.trim(),
          pace: paceInput.value.trim()
        })
      });

      if (response.ok) {
        msg.textContent = 'Амжилттай! Mornrs клубт нэгдсэнд баярлалаа.';
        msg.style.color = '#4CAF50';
        joinForm.reset();
      } else {
        const errorData = await response.json();
        msg.textContent = 'Алдаа: ' + (errorData.message || 'Бүртгэл амжилтгүй');
        msg.style.color = '#ff4444';
      }
    } catch (error) {
      console.error('Network Error:', error);
      msg.textContent = 'Сервертэй холбогдож чадсангүй. Дахин оролдоно уу.';
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