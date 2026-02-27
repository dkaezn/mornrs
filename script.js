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
  // MEMBERS PAGE - Fetch via Backend
  // ====================
  const membersList = document.getElementById('members-list');

  if (membersList) {
    const BACKEND_URL = 'https://mornrs-backend.onrender.com';

    async function loadMembers() {
      try {
        console.log('Fetching members from backend...');
        
        const response = await fetch(`${BACKEND_URL}/api/members`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Members response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`HTTP error ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Raw data from backend:', data);
        
        // Check if data is an array or has records property
        console.log('Data type:', Array.isArray(data) ? 'array' : typeof data);
        
        // If it's an array, log the first item structure
        if (Array.isArray(data) && data.length > 0) {
          console.log('First member structure:', data[0]);
          console.log('First member fields:', Object.keys(data[0]));
        }
        
        // Handle the data based on its structure
        let members = [];
        
        if (Array.isArray(data)) {
          members = data;
        } else if (data.records && Array.isArray(data.records)) {
          members = data.records;
        } else {
          console.error('Unexpected data structure:', data);
          members = [];
        }
        
        if (!members.length) {
          membersList.innerHTML = `
            <li class="member-meta">Хараахан гишүүн байхгүй. Та хамгийн түрүүнд нэгдээрэй!</li>
          `;
        } else {
          membersList.innerHTML = members
            .map(m => {
              // Handle different possible structures
              const memberData = m.fields || m; // If using Airtable records format
              
              return `
              <li>
                <span class="member-name">${memberData.Name || memberData.name || 'Нэргүй'}</span>
                <span class="member-meta">
                  ${memberData.Goal || memberData.goal || 'Зорилгоо оруулаагүй'}${memberData.Pace || memberData.pace ? ' · ' + (memberData.Pace || memberData.pace) + ' мин/км' : ''}
                </span>
              </li>`;
            })
            .join('');
        }
        
      } catch (error) {
        console.error('Error loading members:', error);
        membersList.innerHTML = `
          <li class="member-meta">Гишүүдийг татахад алдаа гарлаа. Дахин оролдоно уу.</li>
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