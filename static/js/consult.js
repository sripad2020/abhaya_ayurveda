/* ============================================================
   AyuSutra — consult.js
   Secure form handling, WhatsApp redirect, Email mailto
   API_BASE points to FastAPI backend
   ============================================================ */

const API_BASE = 'https://api.ayusutra.in'; // ← change to your backend URL
const WHATSAPP_NUMBER = '919876543210';      // ← international format, no +
const CLINIC_EMAIL    = 'heal@ayusutra.in';

// ── Info panel content per type ──────────────────────────────
const INFO_CONTENT = {
  offline: `
    <span class="info-panel-icon">🏥</span>
    <h3>Visit Our Clinic</h3>
    <p>Meet our Ayurvedic physicians face-to-face for a comprehensive examination including Nadi Pariksha (pulse diagnosis).</p>
    <div class="info-features">
      <div class="info-feature"><div class="info-feature-dot"></div><span>Nadi Pariksha (Pulse Diagnosis)</span></div>
      <div class="info-feature"><div class="info-feature-dot"></div><span>Physical constitution assessment</span></div>
      <div class="info-feature"><div class="info-feature-dot"></div><span>Personalised herbal prescription</span></div>
      <div class="info-feature"><div class="info-feature-dot"></div><span>Diet & lifestyle protocol</span></div>
      <div class="info-feature"><div class="info-feature-dot"></div><span>Duration: 45–60 minutes</span></div>
    </div>
  `,
  online: `
    <span class="info-panel-icon">💻</span>
    <h3>Online Consultation</h3>
    <p>Receive expert Ayurvedic guidance from the comfort of your home via video call. Perfect for follow-ups and remote patients.</p>
    <div class="info-features">
      <div class="info-feature"><div class="info-feature-dot"></div><span>Video call (Zoom / Google Meet)</span></div>
      <div class="info-feature"><div class="info-feature-dot"></div><span>Digital Prakruti report sent by email</span></div>
      <div class="info-feature"><div class="info-feature-dot"></div><span>Herbal & diet recommendations</span></div>
      <div class="info-feature"><div class="info-feature-dot"></div><span>Secure & confidential session</span></div>
      <div class="info-feature"><div class="info-feature-dot"></div><span>Duration: 30–45 minutes</span></div>
    </div>
  `,
};

const HEADING = {
  offline: ['In-Person Consultation Request', "Fill in your details and we'll call you to confirm a slot."],
  online:  ['Online Consultation Request',    "We'll send you a meeting link after confirming your slot."],
};

// ── State ────────────────────────────────────────────────────
let currentType = 'offline';
let csrfToken   = '';

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  updateInfoPanel('offline');
  await fetchCsrfToken();

  // Type toggle
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => switchType(btn.dataset.type));
  });

  // Sex selector
  document.querySelectorAll('.sex-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sex-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      document.getElementById('fSex').value = btn.dataset.val;
      clearErr('sex');
    });
  });

  // Char counter
  const msg = document.getElementById('fMessage');
  if (msg) {
    msg.addEventListener('input', () => {
      document.getElementById('charCount').textContent = `${msg.value.length} / 1000`;
    });
  }

  // Form submit
  document.getElementById('consultForm').addEventListener('submit', handleSubmit);

  // Retry
  const retry = document.getElementById('retryBtn');
  if (retry) retry.addEventListener('click', resetForm);

  // WhatsApp button
  document.getElementById('whatsappBtn').addEventListener('click', sendWhatsApp);

  // Email button
  document.getElementById('emailDirectBtn').addEventListener('click', sendEmail);
});

// ── CSRF fetch ───────────────────────────────────────────────
async function fetchCsrfToken() {
  try {
    const res  = await fetch(`${API_BASE}/csrf-token`, { credentials: 'include' });
    const data = await res.json();
    csrfToken  = data.csrf_token;
    document.getElementById('csrfToken').value = csrfToken;
  } catch {
    // If backend not reachable yet, form will still work for direct channels
    console.warn('Could not fetch CSRF token — backend may be offline.');
  }
}

// ── TYPE SWITCH ───────────────────────────────────────────────
function switchType(type) {
  currentType = type;

  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });

  document.getElementById('consultType').value = type;

  updateInfoPanel(type);

  const [heading, sub] = HEADING[type];
  document.getElementById('formHeading').textContent    = heading;
  document.getElementById('formSubheading').textContent = sub;

  const emailGroup = document.getElementById('emailGroup');
  const fEmail     = document.getElementById('fEmail');
  if (type === 'online') {
    emailGroup.classList.remove('hidden');
    fEmail.required = true;
  } else {
    emailGroup.classList.add('hidden');
    fEmail.required = false;
    fEmail.value    = '';
    clearErr('email');
  }
}

function updateInfoPanel(type) {
  const panel = document.getElementById('infoPanel');
  panel.style.opacity = '0';
  setTimeout(() => {
    panel.innerHTML    = INFO_CONTENT[type];
    panel.style.opacity = '1';
  }, 200);
}

// ── VALIDATION ────────────────────────────────────────────────
function validateForm() {
  let valid = true;

  const name = document.getElementById('fName');
  if (!name.value.trim() || name.value.trim().length < 2) {
    setErr('name', 'Please enter your full name (min 2 characters).');
    markError(name);
    valid = false;
  } else { clearErr('name'); clearError(name); }

  const age = document.getElementById('fAge');
  const ageVal = parseInt(age.value);
  if (!age.value || isNaN(ageVal) || ageVal < 1 || ageVal > 120) {
    setErr('age', 'Please enter a valid age (1–120).');
    markError(age);
    valid = false;
  } else { clearErr('age'); clearError(age); }

  const sex = document.getElementById('fSex').value;
  if (!sex) {
    setErr('sex', 'Please select a biological sex option.');
    valid = false;
  } else { clearErr('sex'); }

  const phone = document.getElementById('fPhone');
  const phonePattern = /^[+]?[0-9\s\-]{7,15}$/;
  if (!phonePattern.test(phone.value.trim())) {
    setErr('phone', 'Please enter a valid phone number.');
    markError(phone);
    valid = false;
  } else { clearErr('phone'); clearError(phone); }

  if (currentType === 'online') {
    const email = document.getElementById('fEmail');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.value.trim())) {
      setErr('email', 'Please enter a valid email address.');
      markError(email);
      valid = false;
    } else { clearErr('email'); clearError(email); }
  }

  const concern = document.getElementById('fConcern');
  if (!concern.value) {
    setErr('concern', 'Please select your primary concern.');
    markError(concern);
    valid = false;
  } else { clearErr('concern'); clearError(concern); }

  return valid;
}

function setErr(field, msg) {
  const el = document.getElementById(`err-${field}`);
  if (el) el.textContent = msg;
}
function clearErr(field) {
  const el = document.getElementById(`err-${field}`);
  if (el) el.textContent = '';
}
function markError(el)  { el.classList.add('error'); }
function clearError(el) { el.classList.remove('error'); }

// ── FORM SUBMIT ───────────────────────────────────────────────
async function handleSubmit(e) {
  e.preventDefault();
  if (!validateForm()) return;

  const btn      = document.getElementById('submitBtn');
  const submitTx = document.getElementById('submitText');
  const submitIc = document.getElementById('submitIcon');

  btn.disabled       = true;
  submitTx.innerHTML = '<span class="spinner"></span> Sending…';
  submitIc.style.display = 'none';

  const payload = {
    consult_type: currentType,
    name:    sanitize(document.getElementById('fName').value.trim()),
    age:     parseInt(document.getElementById('fAge').value),
    sex:     document.getElementById('fSex').value,
    phone:   sanitize(document.getElementById('fPhone').value.trim()),
    email:   currentType === 'online' ? sanitize(document.getElementById('fEmail').value.trim()) : null,
    concern: document.getElementById('fConcern').value,
    message: sanitize(document.getElementById('fMessage').value.trim()),
    csrf_token: csrfToken,
  };

  try {
    const res = await fetch(`${API_BASE}/consultations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token':  csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      showSuccess();
    } else {
      const err = await res.json().catch(() => ({}));
      console.error('Server error:', err);
      showError();
    }
  } catch (err) {
    console.error('Network error:', err);
    showError();
  }
}

// ── SANITIZE (XSS prevention on client side) ─────────────────
function sanitize(str) {
  return str.replace(/[<>"'`]/g, c => ({'<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;'}[c]));
}

// ── STATES ────────────────────────────────────────────────────
function showSuccess() {
  document.getElementById('consultForm').classList.add('hidden');
  document.getElementById('successState').classList.remove('hidden');
  document.getElementById('errorState').classList.add('hidden');
}
function showError() {
  document.getElementById('errorState').classList.remove('hidden');
  const btn = document.getElementById('submitBtn');
  btn.disabled = false;
  document.getElementById('submitText').textContent = 'Request Consultation';
  document.getElementById('submitIcon').style.display = '';
}
function resetForm() {
  document.getElementById('errorState').classList.add('hidden');
}

// ── COLLECT FORM DATA AS TEXT ──────────────────────────────────
function collectFormText() {
  const name    = document.getElementById('fName').value.trim() || '(not provided)';
  const age     = document.getElementById('fAge').value || '(not provided)';
  const sex     = document.getElementById('fSex').value || '(not provided)';
  const phone   = document.getElementById('fPhone').value.trim() || '(not provided)';
  const email   = document.getElementById('fEmail').value.trim() || '(not provided)';
  const concern = document.getElementById('fConcern').selectedOptions[0]?.text || '(not provided)';
  const message = document.getElementById('fMessage').value.trim() || 'No additional message.';
  const type    = currentType === 'online' ? 'Online Consultation' : 'In-Person Consultation';

  return { name, age, sex, phone, email, concern, message, type };
}

// ── WHATSAPP REDIRECT ─────────────────────────────────────────
function sendWhatsApp() {
  const f = collectFormText();

  const body = [
    `🙏 *AyuSutra Consultation Request*`,
    ``,
    `*Type:* ${f.type}`,
    `*Name:* ${f.name}`,
    `*Age:* ${f.age}`,
    `*Sex:* ${f.sex}`,
    `*Phone:* ${f.phone}`,
    currentType === 'online' ? `*Email:* ${f.email}` : null,
    `*Primary Concern:* ${f.concern}`,
    ``,
    `*Health Story:*`,
    f.message,
  ].filter(Boolean).join('\n');

  const encoded = encodeURIComponent(body);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
}

// ── EMAIL MAILTO ──────────────────────────────────────────────
function sendEmail() {
  const f = collectFormText();

  // Auto-generate subject from primary concern + name
  const subject = encodeURIComponent(
    `AyuSutra ${f.type} – ${f.concern} | ${f.name}`
  );

  const bodyLines = [
    `Dear AyuSutra Team,`,
    ``,
    `I would like to book a ${f.type} with you.`,
    ``,
    `Details:`,
    `Name: ${f.name}`,
    `Age: ${f.age}`,
    `Biological Sex: ${f.sex}`,
    `Phone: ${f.phone}`,
    currentType === 'online' ? `Email: ${f.email}` : null,
    `Primary Concern: ${f.concern}`,
    ``,
    `Health Story:`,
    f.message,
    ``,
    `Regards,`,
    f.name,
  ].filter(Boolean).join('\n');

  const bodyEncoded = encodeURIComponent(bodyLines);
  window.location.href = `mailto:${CLINIC_EMAIL}?subject=${subject}&body=${bodyEncoded}`;
}