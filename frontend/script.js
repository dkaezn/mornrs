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
// NEWSLETTER FORM - WITH BETTER ERROR HANDLING
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

    msg.textContent = 'Бүртгэж байна...';
    msg.style.color = '#666';

    try {
      console.log('Sending email:', emailInput.value);
      
      const response = await fetch('https://mornrs-backend.onrender.com/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailInput.value
        })
      });

      console.log('Response status:', response.status);
      
      // Try to get the response as text first to see what's coming back
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
      } catch (e) {
        console.error('Could not parse response as JSON:', responseText);
        msg.textContent = 'Серверээс буруу хариу ирлээ';
        msg.style.color = '#ff4444';
        return;
      }

      if (response.ok) {
        msg.textContent = 'Амжилттай бүртгэгдлээ!';
        msg.style.color = '#4CAF50';
        emailInput.value = '';
      } else {
        // Show the actual error message from the server
        msg.textContent = data.error || data.message || 'Алдаа гарлаа. Дахин оролдоно уу.';
        msg.style.color = '#ff4444';
        console.error('Server error:', data);
      }
    } catch (error) {
      console.error('Network Error:', error);
      msg.textContent = 'Сервертэй холбогдож чадсангүй. Дахин оролдоно уу.';
      msg.style.color = '#ff4444';
    }
  });
}

  // ====================
  // JOIN FORM (Airtable via Backend)
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

      if (!nameInput.value.trim() || !emailInput.checkValidity()) {
        msg.textContent = 'Заавал бөглөх талбаруудыг үнэн зөв бөглөнө үү.';
        msg.style.color = '#ff4444';
        return;
      }

      msg.textContent = 'Илгээж байна...';
      msg.style.color = '#666';

      try {
        const response = await fetch('https://mornrs-backend.onrender.com/api/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            goal: goalInput.value.trim(),
            pace: paceInput.value.trim()
          })
        });

        if (response.ok) {
          msg.textContent = 'Mornrs клубт нэгдсэнд баярлалаа!';
          msg.style.color = '#4CAF50';
          joinForm.reset();
          
          // Refresh members list automatically after joining
          if (typeof loadMembers === 'function') {
            setTimeout(loadMembers, 2000); 
          }
        } else {
          msg.textContent = 'Алдаа гарлаа. Дахин оролдоно уу.';
          msg.style.color = '#ff4444';
        }
      } catch (error) {
        msg.textContent = 'Сервер ажиллахгүй байна.';
        msg.style.color = '#ff4444';
      }
    });
  }

  // ====================
  // MEMBERS PAGE - Fetch via Backend
  // ====================
  const membersList = document.getElementById('members-list');

  async function loadMembers() {
    if (!membersList) return;
    
    try {
      const response = await fetch('https://mornrs-backend.onrender.com/api/members');
      
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      
      const records = await response.json();
      
      // Ensure we match Airtable column names exactly (Case Sensitive)
      const members = records.map(record => ({
        name: record.fields.Name || 'Anonymous',
        goal: record.fields.Goal || '',
        pace: record.fields.Pace || ''
      }));

      if (members.length === 0) {
        membersList.innerHTML = `<li class="member-meta">Одоогоор гишүүн байхгүй байна.</li>`;
      } else {
        membersList.innerHTML = members
          .map(m => `
            <li>
              <span class="member-name">${m.name}</span>
              <span class="member-meta">
                ${m.goal}${m.pace ? ' · ' + m.pace + ' min/km' : ''}
              </span>
            </li>`)
          .join('');
      }
    } catch (error) {
      console.error('Error loading members:', error);
      membersList.innerHTML = `<li class="member-meta">Алдаа гарлаа.</li>`;
    }
  }

  // Load members if the list element exists on the page
  if (membersList) {
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
          ev.style.display = filter === 'all' || ev.dataset.type === filter ? '' : 'none';
        });
      });
    });
  }

  console.log('Mornrs Frontend Loaded');
})();