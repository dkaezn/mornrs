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
  // NEWSLETTER FORM (Brevo via Backend)
  // ====================
  const newsletterForm = document.getElementById('newsletter-form');

  if (newsletterForm) {
    const emailInput = document.getElementById('newsletter-email');
    const msg = newsletterForm.querySelector('.form-msg');

    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!emailInput.value || !emailInput.checkValidity()) {
        msg.textContent = 'Зөв имэйл хаяг оруулна уу.';
        msg.style.color = '#ff4444';
        return;
      }

      msg.textContent = 'Бүртгэж байна...';
      msg.style.color = '#666';

      try {
        const response = await fetch('https://mornrs-backend.onrender.com/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailInput.value })
        });

        const data = await response.json();

        if (response.ok) {
          msg.textContent = 'Амжилттай бүртгэгдлээ! Mornrs-д тавтай морил.';
          msg.style.color = '#4CAF50';
          emailInput.value = '';
        } else {
          msg.textContent = data.error || 'Бүртгэл амжилтгүй боллоо';
          msg.style.color = '#ff4444';
        }
      } catch (error) {
        msg.textContent = 'Сервертэй холбогдоход алдаа гарлаа.';
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

      try {
        // We now send to our OWN backend, not Airtable directly
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