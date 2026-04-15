/* ══════════════════════════════════════════════════════════════
   AYUSUTRA — 12 FEATURES  |  features.js  (Complete Final Version)
   All 12 Features · Assessments · Validation · Rich Results
   ══════════════════════════════════════════════════════════════ */

// ── SHARED UTILITIES ────────────────────────────────────────────

function showToast(msg, type) {
  type = type || 'info';
  var w = document.getElementById('ay-toast');
  if (!w) {
    w = document.createElement('div');
    w.id = 'ay-toast';
    w.style.cssText = 'position:fixed;top:22px;right:22px;z-index:99999;display:flex;flex-direction:column;gap:10px;pointer-events:none;max-width:360px;';
    document.body.appendChild(w);
  }
  var cols = { error: '#8B1A1A', success: '#2D5E2E', info: '#D4A017', warning: '#E8760A' };
  var ics  = { error: '⚠️', success: '✅', info: 'ℹ️', warning: '🔔' };
  var c = cols[type] || cols.info;
  var ic = ics[type] || ics.info;
  var t = document.createElement('div');
  t.style.cssText = 'background:#fff;border-left:4px solid ' + c + ';box-shadow:0 8px 32px rgba(42,26,8,0.18);padding:0.9rem 1.3rem;border-radius:10px;font-family:var(--font-body);font-size:0.92rem;color:var(--brown-dark);display:flex;align-items:flex-start;gap:10px;transform:translateX(110%);transition:all 0.4s cubic-bezier(0.175,0.885,0.32,1.275);opacity:0;pointer-events:auto;';
  t.innerHTML = '<span style="font-size:1.15rem;flex-shrink:0;">' + ic + '</span><span style="font-weight:600;line-height:1.4;">' + msg + '</span>';
  w.appendChild(t);
  requestAnimationFrame(function() { t.style.transform = 'translateX(0)'; t.style.opacity = '1'; });
  setTimeout(function() { t.style.transform = 'translateX(110%)'; t.style.opacity = '0'; setTimeout(function() { t.remove(); }, 420); }, 3800);
}

function sanitizeText(s) {
  if (!s && s !== 0) return '';
  var m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;' };
  return String(s).replace(/[&<>"'/]/ig, function(ch) { return m[ch]; });
}

function validateNumber(val, min, max, name) {
  var n = parseFloat(val);
  if (isNaN(n)) { showToast('Please enter a valid number for "' + name + '"', 'error'); return null; }
  if (n < min || n > max) { showToast('"' + name + '" must be between ' + min + ' and ' + max, 'error'); return null; }
  return n;
}

function validateText(val, minLen, maxLen, name) {
  var s = val ? val.trim() : '';
  if (!s || s.length < minLen) { showToast(name + ' must be at least ' + minLen + ' character' + (minLen > 1 ? 's' : ''), 'error'); return null; }
  if (s.length > maxLen) { showToast(name + ' must be less than ' + maxLen + ' characters', 'error'); return null; }
  if (/<[^>]*>|javascript:|on\w+=/i.test(s)) { showToast(name + ' contains invalid characters', 'error'); return null; }
  return sanitizeText(s);
}

function scoreBar(label, pct, color) {
  color = color || 'var(--gold)';
  var p = Math.max(0, Math.min(100, Math.round(pct)));
  return '<div class="score-bar-wrap"><div class="score-bar-top"><span>' + label + '</span><span style="color:' + color + ';">' + p + '%</span></div><div class="score-bar-track"><div class="score-bar-fill sb" data-w="' + p + '" style="background:linear-gradient(to right,' + color + ',' + color + 'bb);"></div></div></div>';
}

function animateBars(wrap) {
  setTimeout(function() {
    var bars = wrap.querySelectorAll('.sb');
    bars.forEach(function(b) { b.style.width = b.dataset.w + '%'; });
  }, 120);
}

function resultCard(title, body, accent) {
  accent = accent || 'var(--gold)';
  return '<div class="result-card" style="border-color:' + accent + '30;"><div class="result-card-title" style="color:' + accent + ';">' + title + '</div>' + body + '</div>';
}

function pillBadge(text, color) {
  color = color || 'var(--gold)';
  return '<span style="background:' + color + '20;border:1px solid ' + color + '50;border-radius:50px;padding:0.2rem 0.75rem;font-size:0.78rem;font-weight:700;color:' + color + ';letter-spacing:0.04em;display:inline-block;">' + text + '</span>';
}

function fadeIn(el) {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  requestAnimationFrame(function() {
    el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  });
}

function mkEl(tag, attrs, html) {
  attrs = attrs || {}; html = html || '';
  var el = document.createElement(tag);
  Object.entries(attrs).forEach(function(e) {
    if (e[0] === 'class') el.className = e[1]; else el.setAttribute(e[0], e[1]);
  });
  el.innerHTML = html;
  return el;
}

function wrapFeature(container, html) {
  var card = mkEl('div', { class: 'test-card' }, html);
  container.appendChild(card);
  return card;
}

function listItems(arr, color) {
  color = color || 'var(--gold)';
  return arr.map(function(i) {
    return '<div style="display:flex;gap:0.5rem;margin-bottom:0.4rem;line-height:1.55;"><span style="color:' + color + ';flex-shrink:0;">◈</span><span style="font-size:0.9rem;">' + i + '</span></div>';
  }).join('');
}

// ── ROUTER ──────────────────────────────────────────────────────
function showHub() {
  document.getElementById('testPanel').style.display  = 'none';
  document.getElementById('hubSection').style.display = 'block';
  document.getElementById('hubHero').style.display    = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // clear any breath timers
  if (window._breathIntervals) {
    Object.keys(window._breathIntervals).forEach(function(k) { clearInterval(window._breathIntervals[k]); });
    window._breathIntervals = {};
  }
}

function loadFeature(name) {
  document.getElementById('hubSection').style.display = 'none';
  document.getElementById('hubHero').style.display    = 'none';
  document.getElementById('testPanel').style.display  = 'block';
  var c = document.getElementById('testContainer');
  c.innerHTML = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  var map = {
    nadi: renderNadiPariksha,
    ritucharya: renderRitucharya,
    dinacharya: renderDinacharya,
    jivha: renderJivhaPariksha,
    agni: renderAgniTracker,
    ama: renderAmaTest,
    rasa: renderRasaPlanner,
    nakshatra: renderNakshatra,
    pranayama: renderPranayama,
    herbchecker: renderHerbChecker,
    panchakarma: renderPanchakarma,
    herbmap: renderHerbMap
  };
  if (map[name]) map[name](c);
}

// Keyboard nav for hub cards
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && e.target.classList.contains('hub-card')) {
    e.target.click();
  }
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
  var nb = document.getElementById('navbar');
  if (nb) { nb.classList.toggle('scrolled', window.scrollY > 40); }
});

// Mobile drawer
document.addEventListener('DOMContentLoaded', function() {
  var ham = document.getElementById('hamburger');
  var drawer = document.getElementById('mobileDrawer');
  var overlay = document.getElementById('mobileOverlay');
  var close = document.getElementById('mobileClose');
  function openDrawer() { drawer.classList.add('open'); overlay.classList.add('open'); }
  function closeDrawer() { drawer.classList.remove('open'); overlay.classList.remove('open'); }
  if (ham) ham.addEventListener('click', openDrawer);
  if (close) close.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);
});

// ════════════════════════════════════════════════════════════════
// FEATURE 1 — NADI PARIKSHA
// ════════════════════════════════════════════════════════════════
function renderNadiPariksha(container) {
  var READINGS = [
    {
      dosha: 'Vata', icon: '🌬️', c: '#6B8CBA',
      pulse: 'Vata Nadi — Serpentine (Sarpa Gati)',
      meaning: 'Your Vata is dominant. Air and ether govern your nervous system, movement, and breath.',
      signs: ['Active, creative mind — tendency to overthink', 'Possible dryness, light sleep, anxiety', 'Irregular digestion, gas, or bloating'],
      foods: ['Warm, oily, grounding: ghee, sesame, sweet potato', 'Avoid raw salads, cold drinks, dry cereals', 'Warm spiced milk with Ashwagandha before sleep'],
      herbs: ['Ashwagandha — strength + grounding', 'Shatavari — deep tissue nourishment', 'Brahmi — calm the nervous system'],
      routine: ['Oil massage (Abhyanga) with sesame oil each morning', 'Sleep before 10 PM — avoid late nights', 'Gentle yoga: forward folds, grounded postures']
    },
    {
      dosha: 'Pitta', icon: '🔥', c: '#E8760A',
      pulse: 'Pitta Nadi — Frog-like (Manduka Gati)',
      meaning: 'Your Pitta is dominant. Fire and water govern digestion, intelligence, and transformation.',
      signs: ['Strong digestion and sharp intellect', 'Possible acidity, skin irritation, impatience', 'Tendency toward intensity and perfectionism'],
      foods: ['Cool, sweet, bitter: coconut, fennel, coriander', 'Avoid spicy, sour, fermented, fried foods', 'Rose water + coriander seed tea through the day'],
      herbs: ['Shatavari — cooling and nourishing', 'Amalaki — Pitta pacifier', 'Brahmi + Guduchi — liver and mind cooling'],
      routine: ['Moon walks in early morning, avoid midday sun', 'Swimming or cooling exercise over intense cardio', 'Sheetali Pranayama daily to cool the fire']
    },
    {
      dosha: 'Kapha', icon: '🌊', c: '#2D5E2E',
      pulse: 'Kapha Nadi — Swan-like (Hamsa Gati)',
      meaning: 'Your Kapha is dominant. Earth and water govern structure, immunity, and endurance.',
      signs: ['Good stamina and emotional depth', 'Possible lethargy, congestion, slow digestion', 'Tendency to hold on — emotionally and physically'],
      foods: ['Light, warm, spicy, dry: ginger, turmeric, millet', 'Avoid dairy, sweets, cold foods, excess oil', 'Hot ginger-honey water each morning'],
      herbs: ['Trikatu — digestive fire kindler', 'Guggulu — metabolism + detox', 'Pippali — lung and Ama cleansing'],
      routine: ['Wake before sunrise — 5:30 AM ideal', 'Vigorous exercise: surya namaskar, running, cycling', 'Dry brushing (Garshana) with raw silk gloves']
    },
    {
      dosha: 'Balanced', icon: '☯️', c: '#A07820',
      pulse: 'Sama Nadi — Balanced (Sama Gati)',
      meaning: 'Your doshas appear balanced. Practice daily for 2 weeks to refine pulse sensitivity.',
      signs: ['Practice daily for 2 weeks', 'Best time: early morning on empty stomach', 'Subtle differences emerge with consistent practice'],
      foods: ['Eat according to your season (Ritucharya)', 'Freshly cooked, warm, whole foods', 'Tridoshic: rice, mung dal, ghee'],
      herbs: ['Triphala — Tridoshic daily tonic', 'Chyawanprash in winter months', 'Turmeric in warm milk daily'],
      routine: ['Consistent daily routine (Dinacharya)', 'Sunrise meditation and Pranayama', 'One day of light fasting per week']
    }
  ];

  var steps = [
    {
      title: 'Preparing for Nadi Pariksha', icon: '🌡️', btn: 'Begin Pulse Reading →',
      html: '<p style="margin-bottom:1.25rem;color:var(--text-muted);line-height:1.75;">Nadi Pariksha (Pulse Diagnosis) is the most profound diagnostic tool in Ayurveda. The pulse carries the intelligence of your entire physiology — Prakruti, Vikruti, and organ health.</p>' +
            '<div class="info-box gold"><strong style="color:var(--brown-dark);">✅ Before you begin:</strong>' +
            listItems(['Sit quietly for 5 minutes', 'Do not eat for at least 1 hour', 'Avoid exercise for 30 minutes', 'Best time: early morning', 'Right palm facing upward']) + '</div>'
    },
    {
      title: 'Finger Placement', icon: '☝️', btn: 'I can feel my pulse →',
      html: '<p style="margin-bottom:1.25rem;">Use your <strong>index, middle, and ring fingers</strong> on your <strong>left wrist</strong>, just below the wrist crease.</p>' +
            '<div class="finger-grid">' +
            [{ f:'Index', d:'Vata', c:'#6B8CBA', e:'🌬️', desc:'Irregular, light, rapid — like a snake.' },
             { f:'Middle', d:'Pitta', c:'#E8760A', e:'🔥', desc:'Sharp, forceful, regular — like a frog.' },
             { f:'Ring', d:'Kapha', c:'#2D5E2E', e:'🌊', desc:'Slow, heavy, steady — like a swan.' }]
            .map(function(x) {
              return '<div class="finger-card" style="background:' + x.c + '10;border:1.5px solid ' + x.c + '40;">' +
                '<span class="finger-emoji">' + x.e + '</span>' +
                '<span class="finger-name" style="color:' + x.c + ';">' + x.f + ' Finger</span>' +
                '<span class="finger-dosha" style="background:' + x.c + '20;color:' + x.c + ';">' + x.d + '</span>' +
                '<span class="finger-desc">' + x.desc + '</span></div>';
            }).join('') + '</div>'
    },
    {
      title: 'What Do You Feel?', icon: '🔍', btn: 'Continue →',
      html: '<p style="margin-bottom:1.5rem;">Eyes closed, three fingers placed. Which finger feels the <strong>strongest pulse</strong>?</p>' +
            '<div style="display:flex;flex-direction:column;gap:0.85rem;">' +
            [{ d:'Vata Dominant', desc:'Index finger most active. Irregular, thin, quick — like a serpent.', c:'#6B8CBA', i:'🌬️' },
             { d:'Pitta Dominant', desc:'Middle finger most active. Sharp, forceful, bounding — like a frog.', c:'#E8760A', i:'🔥' },
             { d:'Kapha Dominant', desc:'Ring finger most active. Slow, broad, wave-like — like a swan.', c:'#2D5E2E', i:'🌊' },
             { d:'Cannot Differentiate', desc:'All feel equal — practice daily for 2 weeks to refine sensitivity.', c:'#A07820', i:'🤔' }]
            .map(function(o, i) {
              return '<div class="nadi-opt" id="nOpt' + i + '" onclick="window._nadiSel(' + i + ');">' +
                '<span style="font-size:2rem;">' + o.i + '</span>' +
                '<div><div style="font-family:var(--font-display);font-size:0.9rem;color:' + o.c + ';margin-bottom:0.25rem;">' + o.d + '</div>' +
                '<div style="font-size:0.86rem;color:var(--text-muted);">' + o.desc + '</div></div></div>';
            }).join('') + '</div>'
    },
    {
      title: 'Resting Heart Rate', icon: '❤️', btn: 'Analyse My Pulse →',
      html: '<p style="margin-bottom:1.5rem;">For a complete picture, enter your approximate resting heart rate (count beats for 30 seconds and multiply by 2).</p>' +
            '<input type="number" id="nadiHR" placeholder="e.g. 72" class="feat-input" style="max-width:280px;display:block;margin:0 auto;text-align:center;font-size:1.2rem;" min="40" max="200">' +
            '<p style="text-align:center;font-size:0.85rem;color:var(--text-muted);margin-top:1rem;">Normal ranges — Vata: 80–100 · Pitta: 70–80 · Kapha: 60–70</p>'
    }
  ];

  var step = 0;
  var nadiSel = -1;

  var wrap = wrapFeature(container,
    '<div class="test-header"><div class="test-header-icon">🌡️</div><div><h2>Nadi Pariksha</h2><p>Ancient Pulse Diagnosis — Self-Guided (4 Steps)</p></div></div>' +
    '<div class="test-progress-bar"><div class="test-progress-fill" id="nProg" style="width:0%"></div></div>' +
    '<div id="nBody" style="padding:1rem 0;"></div>'
  );

  window._nadiSel = function(i) {
    nadiSel = i;
    for (var j = 0; j < 4; j++) {
      var el = document.getElementById('nOpt' + j);
      if (el) { el.style.borderColor = 'rgba(212,160,23,0.2)'; el.style.background = 'var(--white)'; }
    }
    var chosen = document.getElementById('nOpt' + i);
    var colors = ['#6B8CBA', '#E8760A', '#2D5E2E', '#A07820'];
    if (chosen) { chosen.style.borderColor = colors[i]; chosen.style.background = colors[i] + '14'; }
  };

  function renderStep() {
    var body = wrap.querySelector('#nBody');
    var prog = wrap.querySelector('#nProg');
    if (step >= steps.length) { showNadiResult(); return; }
    var s = steps[step];
    prog.style.width = ((step / steps.length) * 100) + '%';
    body.innerHTML =
      '<div style="text-align:center;margin-bottom:1.5rem;">' +
      '<span style="font-size:3.5rem;display:block;margin-bottom:0.75rem;">' + s.icon + '</span>' +
      '<div class="step-counter">Step ' + (step + 1) + ' of ' + steps.length + '</div>' +
      '<h3 class="step-title">' + s.title + '</h3></div>' +
      s.html +
      '<div style="text-align:center;margin-top:2rem;">' +
      '<button onclick="window._nadiNext()" class="btn-gold" style="min-width:220px;">' + s.btn + '</button></div>';
    fadeIn(body);
  }

  window._nadiNext = function() {
    if (step === 2 && nadiSel < 0) { showToast('Please select which finger feels the strongest pulse.', 'error'); return; }
    if (step === 3) {
      var hrEl = document.getElementById('nadiHR');
      var hr = validateNumber(hrEl ? hrEl.value : '72', 40, 200, 'Heart Rate');
      if (hr === null) return;
    }
    step++; renderStep();
  };

  function showNadiResult() {
    var body = wrap.querySelector('#nBody');
    wrap.querySelector('#nProg').style.width = '100%';
    var idx = nadiSel >= 0 ? nadiSel : 3;
    var r = READINGS[idx];
    body.innerHTML =
      '<div class="result-hero" style="border-color:' + r.c + '40;background:' + r.c + '0c;">' +
      '<span class="result-big-icon">' + r.icon + '</span>' +
      '<div style="font-family:var(--font-display);font-size:1.4rem;color:' + r.c + ';margin-bottom:0.5rem;">' + r.pulse + '</div>' +
      '<p class="result-desc">' + r.meaning + '</p></div>' +
      resultCard('🔬 What Your Pulse Reveals', listItems(r.signs, r.c), r.c) +
      resultCard('🌾 Dietary Guidance', listItems(r.foods, 'var(--gold)')) +
      resultCard('🌿 Recommended Herbs', listItems(r.herbs, r.c), r.c) +
      resultCard('🌅 Daily Practices', listItems(r.routine, 'var(--gold)')) +
      '<div class="feat-disclaimer">⚠️ This self-guide aids awareness. Clinical Nadi Pariksha requires a trained Ayurvedic physician.</div>';
    fadeIn(body);
  }

  renderStep();
}

// ════════════════════════════════════════════════════════════════
// FEATURE 2 — RITUCHARYA PLANNER
// ════════════════════════════════════════════════════════════════
function renderRitucharya(container) {
  var month = new Date().getMonth() + 1;
  var seasons = [
    { name:'Shishira', english:'Late Winter', months:[1,2], dosha:'Kapha', icon:'❄️', c:'#6B8CBA',
      eat:['Sesame seeds & til laddoo','Root vegetables (yam, sweet potato)','Warm soups and dals','Fresh ginger tea','Urad dal, wheat, bajra'],
      avoid:['Raw salads and cold foods','Light leafy greens','Excess dairy','Cold beverages'],
      sleep:'7–8 hours. Wake at sunrise (~6:30 AM). No daytime sleep.',
      herbs:['Chyawanprash (immunity booster)','Ashwagandha churna in warm milk','Sitopaladi for respiratory health'],
      exercise:'Vigorous exercise encouraged — surya namaskar, brisk walking, strength training.',
      therapy:['Daily Abhyanga with sesame oil','Steam bath (Swedana)','Avoid Panchakarma unless very strong'] },
    { name:'Vasanta', english:'Spring', months:[3,4], dosha:'Kapha', icon:'🌸', c:'#2D5E2E',
      eat:['Bitter greens (neem, methi)','Honey (not heated)','Barley, millet, light grains','Turmeric and ginger','Old rice, pulses'],
      avoid:['Heavy, sweet, oily foods','Excess dairy — especially curd','Cold drinks and ice','New cereals'],
      sleep:'Wake before sunrise — 5:30 AM ideal. No daytime naps — Kapha accumulates.',
      herbs:['Triphala for detox','Trikatu to kindle Agni','Neem leaf for blood purification'],
      exercise:'Very beneficial now — vigorous movement expels accumulated Kapha.',
      therapy:['Nasya with Anu taila','Udvartana dry powder massage','Tongue and nasal cleansing'] },
    { name:'Grishma', english:'Summer', months:[5,6], dosha:'Pitta', icon:'☀️', c:'#E8760A',
      eat:['Coconut water, chaas (buttermilk)','Cooling fruits: watermelon, ripe mango','Rice, mung dal, sweet potatoes','Rose sharbat, fennel seeds'],
      avoid:['Spicy, sour, salty foods','Excess garlic and onion','Alcohol and fermented foods','Fried snacks'],
      sleep:'Short afternoon nap (15–20 min only). Sleep by 10:30 PM, rise by 6 AM.',
      herbs:['Shatavari (cooling + nourishing)','Amalaki (Pitta cooling)','Brahmi (mental cooling)'],
      exercise:'Morning exercise only — before 8 AM. Swimming and gentle yoga.',
      therapy:['Shirodhara (cooling for Pitta mind)','Coconut oil Abhyanga','Avoid harsh treatments'] },
    { name:'Varsha', english:'Monsoon', months:[7,8], dosha:'Vata/Pitta', icon:'🌧️', c:'#5B7BA0',
      eat:['Warm, freshly cooked food only','Old rice, wheat, barley','Rock salt (not sea salt)','Asafoetida (hing) in cooking'],
      avoid:['Raw food, salads, smoothies','River fish (seasonal)','Excess leafy greens','Curd at night'],
      sleep:'Regular 7–8 hours. Avoid sleeping outdoors.',
      herbs:['Kutki for liver','Giloy/Guduchi immunity','Haridra (turmeric) milk daily'],
      exercise:'Mild — indoor yoga, Pranayama, meditation. Avoid vigorous exercise.',
      therapy:['Basti Karma (Vata season therapy)','Abhyanga with warm oils','Protect joints from dampness'] },
    { name:'Sharad', english:'Autumn', months:[9,10], dosha:'Pitta', icon:'🍂', c:'#C87820',
      eat:['Sweet, bitter, astringent tastes','Pomegranate, amla, grapes','Ghee, light dairy','Coriander, fennel, cardamom'],
      avoid:['Excess sour, salty, pungent foods','Sesame oil (use coconut/sunflower)','Curd at night','Alcohol'],
      sleep:'Moonlight walking beneficial. Sleep by 10 PM. Rise at sunrise.',
      herbs:['Amalaki — best time to start Triphala','Guduchi for immunity transition','Virechana herbs (Pitta elimination)'],
      exercise:'Moderate — morning walks in cool air. Swimming. Avoid noon sun.',
      therapy:['Virechana — ideal season for Panchakarma','Netra Tarpana (eye nourishment)','Rakta Shodhana'] },
    { name:'Hemanta', english:'Early Winter', months:[11,12], dosha:'Vata', icon:'🌿', c:'#3D7A3E',
      eat:['Nourishing, heavy, warm foods','Milk, ghee, sesame, sugarcane','Wheat preparations','Garlic, ginger, pepper in cooking'],
      avoid:['Vata-aggravating: dry, cold, light','Salads and raw food','Fasting (strong Agni — do not waste)','Cold water bathing'],
      sleep:'Longer sleep needed — 8 hours. Rise by 6 AM.',
      herbs:['Ashwagandha + milk (build Ojas)','Bala (strength)','Haritaki (digestion + Vata)'],
      exercise:'Vigorous — season to build physical strength. Weight training, long walks.',
      therapy:['Daily Abhyanga essential','Shirobhyanga (head massage)','Akshi Tarpana (eye oil bathing)'] }
  ];

  var curSeason = seasons.find(function(s) { return s.months.includes(month); }) || seasons[0];
  var wrap = wrapFeature(container,
    '<div class="test-header"><div class="test-header-icon">📅</div><div><h2>Ritucharya Planner</h2>' +
    '<p>Live Seasonal Protocol — ' + new Date().toLocaleDateString('en-IN', {month:'long', year:'numeric'}) + '</p></div></div>' +
    '<div style="padding:1rem 0 0;">' +
    '<div class="info-box gold" style="margin-bottom:1.5rem;"><p style="font-weight:700;color:var(--brown-dark);margin-bottom:0.5rem;">Enter your location (City / State)</p>' +
    '<p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1rem;">We adjust recommendations for your local climate.</p>' +
    '<div style="display:flex;gap:1rem;flex-wrap:wrap;">' +
    '<input type="text" id="rituLoc" placeholder="e.g. Kerala" class="feat-input" style="flex:1;min-width:180px;">' +
    '<button onclick="window._ritSetLoc()" class="btn-gold" style="white-space:nowrap;padding:0.75rem 1.5rem;">Set Location ✦</button>' +
    '</div></div>' +
    '<div id="rituTabs" style="display:none;flex-wrap:wrap;gap:0.6rem;margin-bottom:2rem;">' +
    seasons.map(function(s, i) {
      var active = s.months.includes(month);
      return '<button onclick="window._ritu(' + i + ')" id="rBtn' + i + '" style="padding:0.55rem 1.1rem;border-radius:50px;border:2px solid ' +
        (active ? s.c : 'rgba(212,160,23,0.2)') + ';background:' + (active ? s.c + '18' : 'transparent') + ';font-family:var(--font-body);font-weight:700;font-size:0.85rem;color:' +
        (active ? s.c : 'var(--text-muted)') + ';cursor:pointer;transition:all 0.2s;">' + s.icon + ' ' + s.name + '</button>';
    }).join('') +
    '</div>' +
    '<div id="rituBody" style="display:none;"></div></div>'
  );

  window._ritSetLoc = function() {
    var locEl = document.getElementById('rituLoc');
    if (!locEl) return;
    var loc = validateText(locEl.value, 2, 60, 'Location');
    if (!loc) return;
    showToast('Location set to ' + loc + '! Customising seasons...', 'success');
    document.getElementById('rituTabs').style.display = 'flex';
    var rb = document.getElementById('rituBody');
    rb.style.display = 'block';
    showSeason(curSeason);
  };

  function showSeason(s) {
    var b = wrap.querySelector('#rituBody');
    b.innerHTML =
      '<div style="background:linear-gradient(135deg,' + s.c + '14,' + s.c + '06);border:2px solid ' + s.c + '40;border-radius:var(--radius-xl);padding:2rem;margin-bottom:1.5rem;">' +
      '<div style="display:flex;align-items:center;gap:1.25rem;flex-wrap:wrap;">' +
      '<span style="font-size:3.5rem;">' + s.icon + '</span>' +
      '<div><div style="font-family:var(--font-display);font-size:1.5rem;color:' + s.c + ';">' + s.name + ' Ritu</div>' +
      '<div style="color:var(--text-muted);font-size:0.95rem;">' + s.english + ' · ' + pillBadge(s.dosha + ' dominant', s.c) + '</div></div></div></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1.25rem;">' +
      resultCard('🥗 Foods to Eat', s.eat.map(function(f) { return '<div style="display:flex;gap:0.5rem;margin-bottom:0.35rem;font-size:0.9rem;"><span style="color:var(--green);">✓</span>' + f + '</div>'; }).join(''), 'var(--green)') +
      resultCard('🚫 Foods to Avoid', s.avoid.map(function(f) { return '<div style="display:flex;gap:0.5rem;margin-bottom:0.35rem;font-size:0.9rem;"><span style="color:var(--red-indian);">✗</span>' + f + '</div>'; }).join(''), 'var(--red-indian)') +
      '</div>' +
      resultCard('💤 Sleep & Schedule', '<p style="color:var(--text-muted);">' + s.sleep + '</p>') +
      resultCard('🌿 Seasonal Herbs', listItems(s.herbs, s.c), s.c) +
      resultCard('🏃 Exercise Protocol', '<p style="color:var(--text-muted);">' + s.exercise + '</p>') +
      resultCard('💆 Recommended Therapies', listItems(s.therapy, 'var(--gold)'));
    fadeIn(b);
  }

  window._ritu = function(i) {
    seasons.forEach(function(s, j) {
      var b = document.getElementById('rBtn' + j);
      if (b) {
        b.style.borderColor = j === i ? s.c : 'rgba(212,160,23,0.2)';
        b.style.background  = j === i ? s.c + '18' : 'transparent';
        b.style.color       = j === i ? s.c : 'var(--text-muted)';
      }
    });
    showSeason(seasons[i]);
  };
}

// ════════════════════════════════════════════════════════════════
// FEATURE 3 — DINACHARYA BUILDER
// ════════════════════════════════════════════════════════════════
function renderDinacharya(container) {
  var wrap = wrapFeature(container,
    '<div class="test-header"><div class="test-header-icon">🕐</div><div><h2>Dinacharya Builder</h2><p>Personalised Ayurvedic Daily Routine</p></div></div>' +
    '<div style="padding:1rem 0 0;">' +
    '<div class="result-card" style="margin-bottom:2rem;">' +
    '<h3 style="font-family:var(--font-display);color:var(--brown-dark);margin-bottom:1.5rem;font-size:1.1rem;">Tell us about yourself</h3>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1.25rem;">' +
    '<div><label class="feat-label">Your Name</label><input type="text" id="dName" placeholder="e.g. Arjuna" class="feat-input"></div>' +
    '<div><label class="feat-label">Sleep Quality (1–5)</label>' +
    '<input type="range" id="dSleep" min="1" max="5" value="3" style="width:100%;margin-top:0.5rem;accent-color:var(--gold);">' +
    '<div style="display:flex;justify-content:space-between;font-size:0.74rem;color:var(--text-muted);margin-top:0.2rem;"><span>Poor</span><span>Excellent</span></div></div></div>' +
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem;margin-bottom:1.5rem;">' +
    '<div><label class="feat-label">Your Dosha</label><select id="dDosha" class="feat-select"><option value="">Select Dosha</option><option value="vata">Vata</option><option value="pitta">Pitta</option><option value="kapha">Kapha</option><option value="vata-pitta">Vata-Pitta</option><option value="pitta-kapha">Pitta-Kapha</option></select></div>' +
    '<div><label class="feat-label">Wake Up Time</label><select id="dWake" class="feat-select"><option value="430">4:30 AM</option><option value="500">5:00 AM</option><option value="530" selected>5:30 AM (Ideal)</option><option value="600">6:00 AM</option><option value="700">7:00 AM</option></select></div>' +
    '<div><label class="feat-label">Work Type</label><select id="dJob" class="feat-select"><option value="desk">Desk / Office</option><option value="field">Field / Active</option><option value="creative">Creative / Student</option><option value="shift">Shift Work</option></select></div></div>' +
    '<button onclick="window._buildDin()" class="btn-gold" style="width:100%;">Generate My Dinacharya ✦</button></div>' +
    '<div id="dinR" style="display:none;"></div></div>'
  );

  window._buildDin = function() {
    var name = validateText(document.getElementById('dName').value, 2, 30, 'Name');
    if (!name) return;
    var dosha = document.getElementById('dDosha').value;
    if (!dosha) { showToast('Please select your Dosha to generate the routine.', 'error'); return; }
    var wv    = parseInt(document.getElementById('dWake').value);
    var job   = document.getElementById('dJob').value;
    var sleep = parseInt(document.getElementById('dSleep').value);
    var h0 = Math.floor(wv / 100), m0 = wv % 100;
    var t = h0 * 60 + m0;
    function fmt(mins) {
      var total = t + mins; t += mins;
      var h = Math.floor(total / 60) % 24, m = total % 60;
      var ampm = h < 12 ? 'AM' : 'PM';
      var dh = h > 12 ? h - 12 : (h === 0 ? 12 : h);
      return dh + ':' + String(m).padStart(2, '0') + ' ' + ampm;
    }
    var dr = {
      vata:        { oil:'sesame',             herb:'Ashwagandha',           yoga:'Gentle forward folds, grounding postures',        meal:'Warm, oily, sweet — rice, ghee, root vegetables' },
      pitta:       { oil:'coconut',            herb:'Shatavari + Brahmi',    yoga:'Cooling inversions, moon salutations',             meal:'Cool, bitter, sweet — coconut, fennel, coriander' },
      kapha:       { oil:'mustard or sesame',  herb:'Trikatu + Guggulu',     yoga:'Vigorous vinyasa, surya namaskar',                 meal:'Light, warm, spicy — ginger, millet, bitter greens' },
      'vata-pitta':{ oil:'sesame (warm season: coconut)', herb:'Ashwagandha + Shatavari', yoga:'Moderate intensity, balanced flow', meal:'Nourishing and cooling — warm soups, ghee, coconut' },
      'pitta-kapha':{ oil:'coconut or sunflower', herb:'Triphala + Brahmi',  yoga:'Moderate vigour, avoid overheating',              meal:'Light and cooling — barley, salads, bitter greens' }
    }[dosha] || { oil:'sesame', herb:'Ashwagandha', yoga:'Gentle yoga', meal:'Warm cooked food' };

    var sleepMsg = sleep <= 2
      ? '⚠️ Your sleep quality is poor. Prioritise sleep hygiene: oil foot massage before bed, chamomile tea, no screens after 9 PM.'
      : sleep >= 4 ? '✅ Great sleep quality! Maintain your current pre-sleep routine.'
      : '💡 Moderate sleep. Try warm milk with Ashwagandha 30 min before bed.';

    var schedule = [
      { time: fmt(0),  act: '🌅 Wake Up & Gratitude',   detail: 'Rise slowly, offer gratitude. No phone for first 15 minutes.' },
      { time: fmt(5),  act: '💧 Copper Water',           detail: 'Drink 2 glasses of warm water stored overnight in copper vessel.' },
      { time: fmt(10), act: '🪥 Oral Care',              detail: 'Tongue scraping (7 strokes), oil pulling with ' + dr.oil + ' oil (10 min), neem brush.' },
      { time: fmt(15), act: '🚿 Eliminate & Cleanse',    detail: 'Natural elimination, warm water face wash, nasal rinse (Jala Neti).' },
      { time: fmt(20), act: '💆 Abhyanga',               detail: 'Self-massage with warm ' + dr.oil + ' oil. 10–15 minutes, followed by warm shower.' },
      { time: fmt(30), act: '🧘 Yoga & Pranayama',       detail: job === 'field' ? 'Moderate stretching, breathwork — 20 min.' : 'Practice: ' + dr.yoga + '. 30–45 minutes.' },
      { time: fmt(45), act: '🙏 Meditation',             detail: 'Sit quietly. Mantra, breathwork, or silent awareness — 15 minutes.' },
      { time: fmt(40), act: '🍵 Morning Herbal Drink',   detail: 'Warm water with ginger + lemon OR herbal tea. Take ' + dr.herb + ' if prescribed.' },
      { time: fmt(30), act: '🍽️ Breakfast',              detail: dr.meal + '. Eat sitting, in silence, with gratitude.' },
      { time: fmt(240),act: '🍱 Lunch (Main Meal)',       detail: 'Largest meal of the day. Eat 75% capacity. Walk 100 steps after.' },
      { time: fmt(240),act: '🍵 Afternoon Tea',           detail: 'Herbal tea — tulsi, ginger, or CCF (cumin-coriander-fennel).' },
      { time: fmt(90), act: '🌙 Dinner (Light)',          detail: 'Light, warm, easy to digest. At least 3 hours before sleep.' },
      { time: fmt(60), act: '📚 Evening Wind-Down',       detail: 'Reading, gentle walk, family time. No work, no screens after 9 PM.' },
      { time: fmt(30), act: '🌙 Sleep Ritual',            detail: 'Warm milk with ' + (dosha === 'kapha' ? 'turmeric' : 'Ashwagandha') + '. Oil on feet. Sleep by 10 PM.' }
    ];

    var r = wrap.querySelector('#dinR');
    r.style.display = '';
    r.innerHTML =
      '<div class="result-hero" style="text-align:left;margin-bottom:1.5rem;">' +
      '<div style="font-family:var(--font-display);font-size:1.4rem;color:var(--brown-dark);margin-bottom:0.4rem;">🌅 ' + name + '\'s Dinacharya</div>' +
      '<div style="color:var(--text-muted);font-size:0.9rem;margin-bottom:1rem;">' + dosha.charAt(0).toUpperCase() + dosha.slice(1) + ' Constitution · ' + job.charAt(0).toUpperCase() + job.slice(1) + ' Lifestyle</div>' +
      '<div class="info-box gold" style="margin:0;">' + sleepMsg + '</div></div>' +
      schedule.map(function(s) {
        return '<div class="schedule-row"><div class="schedule-time">' + s.time + '</div>' +
          '<div><div class="schedule-act">' + s.act + '</div><div class="schedule-desc">' + s.detail + '</div></div></div>';
      }).join('') +
      '<div class="feat-disclaimer">⚕️ This routine is a personalised Ayurvedic guide. Adjust based on seasonal changes and your physician\'s advice.</div>';
    fadeIn(r);
    r.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
}

// ════════════════════════════════════════════════════════════════
// FEATURE 4 — JIVHA PARIKSHA (Tongue Diagnosis)
// ════════════════════════════════════════════════════════════════
function renderJivhaPariksha(container) {
  var questions = [
    { q:'What is the PRIMARY COLOR of your tongue?', icon:'🎨',
      opts:[{text:'Pale pink / Very light', score:{vata:2,ama:0}, meaning:'Possible blood deficiency, poor assimilation'},
            {text:'Healthy rose pink', score:{}, meaning:'Excellent — this is the ideal balanced color'},
            {text:'Bright red / Scarlet', score:{pitta:3}, meaning:'Pitta excess, inflammation, internal heat'},
            {text:'Dark red / Purplish tint', score:{vata:1,pitta:2,ama:1}, meaning:'Blood stagnation, Rakta Dushti'},
            {text:'Yellowish / Greenish tinge', score:{pitta:2,kapha:2,ama:2}, meaning:'Bile excess, liver-gallbladder stress'}] },
    { q:'How THICK is the coating on your tongue?', icon:'🌫️',
      opts:[{text:'No coating — tongue is clean', score:{ama:0}, meaning:'Excellent Agni, minimal toxins'},
            {text:'Thin transparent film', score:{ama:1}, meaning:'Mild Ama — digestive cleansing needed'},
            {text:'Moderate white coating', score:{ama:2}, meaning:'Significant Ama accumulation'},
            {text:'Thick yellow/green coating', score:{pitta:1,ama:3}, meaning:'Pitta + Ama, liver under stress'},
            {text:'Very thick brown/grey coating', score:{ama:4,kapha:1}, meaning:'Heavy toxic load — Agni severely compromised'}] },
    { q:'What is the SHAPE and SIZE of your tongue?', icon:'📐',
      opts:[{text:'Normal medium — well-proportioned', score:{}, meaning:'Balanced'},
            {text:'Long and thin, tends to tremble', score:{vata:3}, meaning:'Vata nervous system excess'},
            {text:'Wide and thick — fills the mouth', score:{kapha:3}, meaning:'Kapha dominant, slower metabolism'},
            {text:'Sharp, pointed tip', score:{pitta:2}, meaning:'Pitta dominant, heat excess'},
            {text:'Deviated / pulls to one side', score:{vata:2}, meaning:'Nerve imbalance — consult physician'}] },
    { q:'What is the MOISTURE level of your tongue?', icon:'💧',
      opts:[{text:'Evenly moist — normal', score:{}, meaning:'Balanced fluid metabolism'},
            {text:'Dry and rough surface', score:{vata:3}, meaning:'Vata excess, dehydration'},
            {text:'Slightly dry', score:{vata:1}, meaning:'Mild Vata dryness'},
            {text:'Excessively wet / saliva pooling', score:{kapha:3}, meaning:'Kapha excess, Ama accumulation'},
            {text:'Dry patches in places', score:{vata:2,pitta:1}, meaning:'Mixed Vata-Pitta imbalance'}] },
    { q:'Do you see CRACKS or fissures on the tongue surface?', icon:'〰️',
      opts:[{text:'No cracks — smooth surface', score:{}, meaning:'Good tissue nourishment'},
            {text:'Fine hairline cracks', score:{vata:1}, meaning:'Mild Vata dryness'},
            {text:'Multiple cracks across surface', score:{vata:3}, meaning:'Chronic Vata, malabsorption'},
            {text:'Deep midline crack', score:{vata:2,pitta:1}, meaning:'Kidney/spine or constitutional Vata'},
            {text:'Geographic tongue — irregular patches', score:{vata:1,pitta:2}, meaning:'Pitta inflammation, stomach stress'}] },
    { q:'Are there SCALLOP MARKS (tooth indentations) on the tongue edges?', icon:'🔘',
      opts:[{text:'None', score:{}, meaning:'Good'},
            {text:'Slight scalloping', score:{kapha:1}, meaning:'Mild Kapha, slight swelling'},
            {text:'Prominent scalloping', score:{kapha:3}, meaning:'Significant water retention, malabsorption'},
            {text:'Teeth marks + swollen tongue', score:{kapha:2,ama:2}, meaning:'Kapha + Ama, poor mineral absorption'}] },
    { q:'What do you notice about the BACK of your tongue (near throat)?', icon:'🔍',
      opts:[{text:'Clean — no abnormality', score:{}, meaning:'Colon and lower organs clear'},
            {text:'Heavily coated at back', score:{ama:3,kapha:1}, meaning:'Colon toxins — Ama in lower GI'},
            {text:'Red/inflamed near throat', score:{pitta:2}, meaning:'Throat, thyroid, or Pitta heat'},
            {text:'Pale and dry at the back', score:{vata:2}, meaning:'Lower digestive weakness, Vata in colon'}] },
    { q:'Have you noticed any BREATH ODOR upon waking?', icon:'💨',
      opts:[{text:'Fresh / Neutral', score:{}, meaning:'Excellent digestive health'},
            {text:'Slightly sour', score:{pitta:1,ama:1}, meaning:'Mild Pitta/acid accumulation'},
            {text:'Strongly sour or acidic', score:{pitta:3,ama:1}, meaning:'Excess acid — Pitta, liver stress'},
            {text:'Sweet or fruity odor', score:{kapha:1}, meaning:'Possible blood sugar concern — see doctor'},
            {text:'Foul / Putrid odor', score:{ama:4}, meaning:'High Ama, severe digestive dysfunction'}] }
  ];

  var step = 0, answers = [];
  var wrap = wrapFeature(container,
    '<div class="test-header"><div class="test-header-icon">👅</div><div><h2>Jivha Pariksha</h2><p>Tongue Diagnosis — 8-Step Clinical Assessment</p></div></div>' +
    '<div class="info-box gold" style="margin-top:1rem;">💡 <strong style="color:var(--brown-dark);">How to check:</strong> Observe your tongue in natural light each morning before brushing. Stick it out fully and relax it.</div>' +
    '<div class="test-progress-bar" style="margin-top:1.25rem;"><div class="test-progress-fill" id="jivhaProg" style="width:0%"></div></div>' +
    '<div id="jivhaBody" style="padding:1rem 0;"></div>'
  );

  function renderJivhaStep() {
    var body = wrap.querySelector('#jivhaBody');
    var prog = wrap.querySelector('#jivhaProg');
    if (step >= questions.length) { showJivhaResult(); return; }
    var q = questions[step];
    prog.style.width = ((step / questions.length) * 100) + '%';
    body.innerHTML =
      '<div style="text-align:center;margin-bottom:1.5rem;">' +
      '<span style="font-size:2.5rem;display:block;margin-bottom:0.5rem;">' + q.icon + '</span>' +
      '<div class="step-counter">Question ' + (step + 1) + ' of ' + questions.length + '</div>' +
      '<h3 class="step-title">' + q.q + '</h3></div>' +
      '<div id="jOpts" style="display:flex;flex-direction:column;gap:0.7rem;">' +
      q.opts.map(function(o, i) {
        return '<button class="option-btn" id="jOpt' + i + '" onclick="window._jivhaPick(' + i + ')">' +
          '<span class="opt-main">' + o.text + '</span>' +
          '<span class="opt-sub">' + (o.meaning || '') + '</span></button>';
      }).join('') + '</div>' +
      '<div id="jNextWrap" style="text-align:center;margin-top:1.5rem;display:none;">' +
      '<button onclick="window._jivhaNext()" class="btn-gold" style="min-width:200px;">Next →</button></div>';
    fadeIn(body);
  }

  window._jivhaPick = function(i) {
    var q = questions[step];
    for (var j = 0; j < q.opts.length; j++) {
      var b = document.getElementById('jOpt' + j);
      if (b) { b.classList.remove('selected'); }
    }
    var btn = document.getElementById('jOpt' + i);
    if (btn) btn.classList.add('selected');
    answers[step] = q.opts[i];
    var nw = document.getElementById('jNextWrap');
    if (nw) nw.style.display = 'block';
  };

  window._jivhaNext = function() {
    if (!answers[step]) { showToast('Please select an option before continuing.', 'error'); return; }
    step++; renderJivhaStep();
  };

  function showJivhaResult() {
    var body = wrap.querySelector('#jivhaBody');
    wrap.querySelector('#jivhaProg').style.width = '100%';
    var totals = { vata: 0, pitta: 0, kapha: 0, ama: 0 };
    answers.forEach(function(a) {
      if (a && a.score) Object.entries(a.score).forEach(function(e) { totals[e[0]] = (totals[e[0]] || 0) + e[1]; });
    });
    var maxV = { vata:15, pitta:15, kapha:12, ama:16 };
    var pct  = {
      vata:  Math.min(100, Math.round((totals.vata  / maxV.vata)  * 100)),
      pitta: Math.min(100, Math.round((totals.pitta / maxV.pitta) * 100)),
      kapha: Math.min(100, Math.round((totals.kapha / maxV.kapha) * 100)),
      ama:   Math.min(100, Math.round((totals.ama   / maxV.ama)   * 100))
    };
    var dominant = Object.entries({ Vata: pct.vata, Pitta: pct.pitta, Kapha: pct.kapha })
      .sort(function(a, b) { return b[1] - a[1]; })[0];
    var amaLevel = pct.ama >= 60 ? 'High Ama — serious detox needed' : pct.ama >= 30 ? 'Moderate Ama — digestive cleansing recommended' : 'Low Ama — good digestive health';
    var colMap = { Vata: '#6B8CBA', Pitta: '#E8760A', Kapha: '#2D5E2E' };
    var c = colMap[dominant[0]];
    var protocols = {
      Vata:  { herbs:['Ashwagandha — strength + nervous system','Shatavari — deep tissue nourishment','Brahmi — nervous calm'], foods:['Warm, oily, sweet foods','Ghee, sesame, root vegetables','Warm spiced milk nightly'], life:['Daily warm oil Abhyanga','Regular meal times — no skipping','Early sleep before 10 PM'] },
      Pitta: { herbs:['Shatavari — cooling + nourishing','Amalaki — liver + blood cooling','Brahmi + Guduchi — inflammation'], foods:['Cool, bitter, sweet foods','Coconut water, fennel tea, rose water','Avoid fried, spicy, fermented foods'], life:['Morning exercise before 8 AM','Sheetali Pranayama daily','Moon walks, avoid midday sun'] },
      Kapha: { herbs:['Trikatu — digestive fire (Agni)','Guggulu — metabolism + detox','Pippali — lung + Ama clearing'], foods:['Light, warm, spiced foods','Ginger-honey water mornings','Millet, barley, bitter greens'], life:['Wake before 5:30 AM','Vigorous daily exercise','Dry brushing (Garshana) massage'] }
    };
    var p = protocols[dominant[0]] || protocols.Vata;
    body.innerHTML =
      '<div class="result-hero" style="border-color:' + c + '40;background:' + c + '0c;">' +
      '<span style="font-size:3rem;display:block;margin-bottom:0.5rem;">👅</span>' +
      '<div style="font-family:var(--font-display);font-size:1.4rem;color:' + c + ';margin-bottom:0.5rem;">Primary Imbalance: ' + dominant[0] + '</div>' +
      '<p class="result-desc">Your tongue reveals ' + dominant[0] + ' as your most elevated dosha, with ' + (pct.ama >= 30 ? 'notable Ama accumulation.' : 'minimal Ama.') + '</p></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">' +
      scoreBar('Vata Score', pct.vata, '#6B8CBA') + scoreBar('Pitta Score', pct.pitta, '#E8760A') + '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem;">' +
      scoreBar('Kapha Score', pct.kapha, '#2D5E2E') + scoreBar('Ama (Toxins)', pct.ama, '#8B1A1A') + '</div>' +
      resultCard('☣️ Ama Status', '<p style="font-weight:700;color:' + (pct.ama >= 60 ? 'var(--red-indian)' : pct.ama >= 30 ? '#E8AE0A' : 'var(--green)') + ';">' + amaLevel + '</p>', pct.ama >= 60 ? 'var(--red-indian)' : 'var(--gold)') +
      resultCard('🌿 Recommended Herbs', listItems(p.herbs, c), c) +
      resultCard('🥗 Dietary Guidance', listItems(p.foods, 'var(--gold)')) +
      resultCard('🌅 Lifestyle Protocol', listItems(p.life, 'var(--gold)')) +
      '<div class="feat-disclaimer">🔬 Tongue changes persisting more than 2 weeks warrant clinical examination by an Ayurvedic physician.</div>';
    animateBars(body); fadeIn(body);
  }
  renderJivhaStep();
}

// ════════════════════════════════════════════════════════════════
// FEATURE 5 — AGNI TRACKER (12 Questions)
// ════════════════════════════════════════════════════════════════
function renderAgniTracker(container) {
  var qs = [
    { id:'a1', q:'Do you feel genuinely hungry at regular meal times?', opts:['Never — food is not appealing','Rarely — I eat out of habit','Sometimes — appetite is inconsistent','Yes — good and regular hunger','Very strong — sometimes aggressive hunger'], sc:[0,1,2,3,2] },
    { id:'a2', q:'How do you feel 1–2 hours after your main meal?', opts:['Heavy, sleepy, lethargic','Bloated and uncomfortable','Neutral — neither good nor bad','Energised and satisfied','Restless, burning, or incomplete digestion'], sc:[1,1,2,4,1] },
    { id:'a3', q:'How would you describe your daily elimination?', opts:['Constipated — less than once a day','Sluggish — incomplete or difficult','Once a day — normal consistency','Once or twice — complete and easy','Loose, urgent, or variable'], sc:[0,1,3,4,1] },
    { id:'a4', q:'Do you experience gas, bloating, or abdominal distension?', opts:['Severe — very uncomfortable daily','Moderate — affects my routine','Mild and occasional','Rarely or never','Only after specific foods'], sc:[0,1,2,4,2] },
    { id:'a5', q:'How does food taste and smell to you?', opts:['Everything is tasteless — no enthusiasm','Mostly bland — food is just fuel','Normal — I enjoy usual foods','Food tastes delicious — I enjoy meals','Hyper-sensitive — smells trigger nausea'], sc:[0,1,3,4,2] },
    { id:'a6', q:'Do you experience acidity or burning after eating?', opts:['Never','Rarely — only with spicy food','Sometimes — a few times a week','Often — most meals cause burning','Always — severe and chronic'], sc:[4,3,2,1,0] },
    { id:'a7', q:'Does food feel like it sits undigested for hours?', opts:['Always — food never fully digests','Often — I feel heavy for hours','Sometimes','Rarely','Never — I digest quickly'], sc:[0,1,2,3,4] },
    { id:'a8', q:'How is your appetite first thing in the morning?', opts:['Cannot eat anything in the morning','Very light appetite — just tea','Mild appetite — small breakfast ok','Good appetite — ready for a proper meal','Ravenous — must eat immediately'], sc:[1,1,3,4,2] },
    { id:'a9', q:'What are your typical food cravings?', opts:['Heavy, fried, or oily foods','Sweet, cold, dairy-heavy foods','No strong cravings — balanced','Spicy, sour, or stimulating foods','No appetite — nothing appeals'], sc:[1,1,4,2,0] },
    { id:'a10', q:'Do you have undigested food particles in your stool?', opts:['Yes — always, clearly visible','Often — especially certain foods','Occasionally','Rarely','Never'], sc:[0,1,2,3,4] },
    { id:'a11', q:'Can you smell unpleasant odors from your own body or mouth?', opts:['Strong bad breath even after brushing','Noticeable body odor most days','Mild odor sometimes','Rarely any odor','Fresh — no odor issues'], sc:[0,1,2,3,4] },
    { id:'a12', q:'How is your energy level and mental clarity between meals?', opts:['Foggy, exhausted, must nap','Low energy — dragging through the day','Moderate — manageable','Good steady energy','Sharp, clear, sustained energy all day'], sc:[0,1,2,3,4] }
  ];

  var wrap = wrapFeature(container,
    '<div class="test-header"><div class="test-header-icon">🔥</div><div><h2>Agni Tracker</h2><p>Digestive Fire Assessment — 12 Clinical Parameters</p></div></div>' +
    '<div style="padding:1rem 0 0;">' +
    '<div class="info-box gold" style="margin-bottom:1.5rem;">🔥 <strong style="color:var(--brown-dark);">About Agni:</strong> Agni (digestive fire) is the master of your health in Ayurveda. 80% of disease begins with impaired Agni. Rate your last 3–7 days.</div>' +
    qs.map(function(q, i) {
      return '<div class="q-row">' +
        '<div class="q-row-label">' + (i + 1) + '. ' + q.q + '</div>' +
        '<div class="q-radio-opts">' +
        q.opts.map(function(o, j) {
          return '<label class="q-radio-label" id="ql_' + q.id + '_' + j + '">' +
            '<input type="radio" name="agni_' + q.id + '" value="' + j + '" style="accent-color:var(--gold);" onchange="document.querySelectorAll(\'[id^=\\\'ql_' + q.id + '_\\\']\').forEach(function(l){l.classList.remove(\'checked\')});this.closest(\'.q-radio-label\').classList.add(\'checked\')">' +
            '<span>' + o + '</span></label>';
        }).join('') + '</div></div>';
    }).join('') +
    '<div class="q-row"><p class="q-row-label">📓 Optional: What did you eat today? (food diary)</p>' +
    '<textarea id="agniFood" class="feat-textarea" placeholder="e.g. Rice, dal, sabzi for lunch. Had coffee and biscuits. Skipped breakfast..." maxlength="300"></textarea>' +
    '<div class="char-counter" id="agniFC">0 / 300</div></div>' +
    '<button onclick="window._agni()" class="btn-gold" style="width:100%;margin-top:0.75rem;">Analyse My Agni ✦</button>' +
    '<div id="agniR" style="display:none;margin-top:2rem;"></div></div>'
  );

  var ta = wrap.querySelector('#agniFood'), fc = wrap.querySelector('#agniFC');
  if (ta && fc) ta.addEventListener('input', function() { fc.textContent = ta.value.length + ' / 300'; });

  window._agni = function() {
    var total = 0, answered = 0;
    qs.forEach(function(q) {
      var s = wrap.querySelector('input[name="agni_' + q.id + '"]:checked');
      if (s) { total += q.sc[parseInt(s.value)] || 0; answered++; }
    });
    if (answered < qs.length) { showToast('Please answer all ' + qs.length + ' questions before calculating.', 'error'); return; }
    var diary = wrap.querySelector('#agniFood') ? wrap.querySelector('#agniFood').value.trim() : '';
    var maxScore = 48;
    var pct = Math.round((total / maxScore) * 100);
    var level, c, icon, agniType, detail, recs, herbs;
    if (pct >= 75) {
      level = 'Sama Agni'; c = 'var(--green)'; icon = '🔥'; agniType = 'Balanced Digestive Fire';
      detail = 'Excellent! Your digestive fire is strong, consistent, and well-balanced. Food is fully digested and nutrients are optimally absorbed. This is the foundation of good health.';
      recs  = ['Maintain current Dinacharya — your routine is working', 'Eat at the same times each day to sustain Agni', 'Continue Triphala before bed for long-term maintenance', 'Seasonal Panchakarma to preserve this balance'];
      herbs = ['Triphala churna — 1 tsp before bed in warm water', 'Chyawanprash — 1 tsp in winter mornings'];
    } else if (pct >= 55) {
      level = 'Vishama Agni'; c = '#E8AE0A'; icon = '〰️'; agniType = 'Variable / Irregular Fire (Vata)';
      detail = 'Your digestive fire is inconsistent — sometimes strong, sometimes weak. This Vata-type imbalance creates unpredictable digestion, gas, and irregular elimination. Routine is the medicine.';
      recs  = ['Eat at exactly the same times daily — no skipping meals', 'Warm ginger tea 20 min before each meal', 'Avoid snacking between meals — let Agni reset', 'Hingvastak churna (1/4 tsp) with warm water before meals', 'Warm sesame oil Abhyanga every morning'];
      herbs = ['Hingvastak churna — 1/4 tsp before meals for Vata Agni', 'Triphala + Trikatu combination — 30 days', 'Ashwagandha — for nervous system grounding'];
    } else if (pct >= 35) {
      level = 'Manda Agni'; c = '#6B8CBA'; icon = '🕯️'; agniType = 'Sluggish / Low Fire (Kapha)';
      detail = 'Your digestive fire is low and slow — food takes too long to digest, leading to heaviness, Ama accumulation, and low energy. Kapha is dampening the flame. Kindle the fire deliberately.';
      recs  = ['Trikatu churna (1/4 tsp) before every meal — 30 days', 'Reduce food quantity to 75% of your normal intake', 'No cold drinks, raw food, or dairy', 'Light fasting (fruit + liquids only) one day per week', 'Walk 30 min after every meal'];
      herbs = ['Trikatu — the premier Agni-kindling formula', 'Guggulu — for Kapha metabolism', 'Pippali — lung + digestive fire'];
    } else {
      level = 'Tikshna Agni'; c = 'var(--red-indian)'; icon = '⚡'; agniType = 'Sharp / Hyperactive Fire (Pitta)';
      detail = 'Your digestive fire is too sharp and burning — Pitta type. Food may digest quickly with acidity, burning, and irritation. Do not skip meals; cool the fire without extinguishing it.';
      recs  = ['Never skip meals — eat before Pitta peaks (noon)', 'Shatavari + ghee + warm milk 30 min before food', 'Avoid spicy, sour, fermented, and fried foods', 'Coconut water + fennel seed water through the day', 'Sheetali Pranayama morning and evening'];
      herbs = ['Shatavari — premier Pitta cooler', 'Amalaki — gentle liver tonic for Tikshna', 'Licorice (Yashtimadhu) — soothe the GI tract'];
    }
    var r = wrap.querySelector('#agniR');
    r.style.display = '';
    r.innerHTML =
      '<div class="result-hero" style="border-color:' + c + '50;background:' + c + '10;">' +
      '<span class="result-big-icon">' + icon + '</span>' +
      '<div style="font-family:var(--font-display);font-size:1.5rem;color:' + c + ';margin-bottom:0.25rem;">' + level + '</div>' +
      '<div style="font-size:0.9rem;color:var(--text-muted);margin-bottom:1rem;">' + agniType + '</div>' +
      scoreBar('Agni Strength', pct, c) +
      '<p class="result-desc">' + detail + '</p></div>' +
      (diary ? resultCard('📓 Your Food Diary', '<p style="color:var(--text-muted);font-size:0.9rem;">' + sanitizeText(diary) + '</p><p style="margin-top:0.75rem;font-size:0.85rem;font-weight:600;color:var(--brown-dark);">💡 Review frequency of warm cooked foods vs. cold/processed. Your Agni type suggests the adjustments above.</p>') : '') +
      resultCard('📋 Your Corrective Protocol', listItems(recs, c), c) +
      resultCard('🌿 Herbal Prescription', herbs.map(function(h) { return '<div style="display:flex;gap:0.5rem;margin-bottom:0.4rem;font-size:0.9rem;"><span style="color:var(--green);">🌿</span>' + h + '</div>'; }).join(''), 'var(--green)') +
      '<div class="feat-disclaimer">⚕️ Persistent digestive issues warrant evaluation by an Ayurvedic physician.</div>';
    animateBars(r); fadeIn(r);
    r.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
}

// ════════════════════════════════════════════════════════════════
// FEATURE 6 — AMA ACCUMULATION TEST (16 Questions)
// ════════════════════════════════════════════════════════════════
function renderAmaTest(container) {
  var qs = [
    { q:'You wake up feeling heavy, dull, or unrested despite adequate sleep', w:3 },
    { q:'White, yellow, or brown coating on your tongue most mornings', w:3 },
    { q:'Mental fog, brain fog, or dullness — especially after meals', w:2 },
    { q:'Stiffness or heaviness in joints, especially in the morning', w:2 },
    { q:'Food sits heavily — digestion feels slow or incomplete', w:3 },
    { q:'Bloating, gas, or incomplete elimination most days', w:2 },
    { q:'Heaviness or blockage sensations in chest, sinuses, or throat', w:2 },
    { q:'Strong cravings for sweets, heavy, or fried junk foods', w:1 },
    { q:'Body feels heavier without significant change in diet', w:2 },
    { q:'Dark urine, or heavy, sticky, malodorous stools', w:2 },
    { q:'Persistent lethargy, unmotivated, loss of enthusiasm', w:2 },
    { q:'Bad breath or unpleasant taste even after brushing thoroughly', w:3 },
    { q:'Skin appears dull, grey, or lacks luster — not glowing', w:2 },
    { q:'Low appetite or feeling full very quickly when eating', w:2 },
    { q:'Frequent mucus, excessive phlegm, or nasal congestion', w:2 },
    { q:'Feeling of obstruction in the body — something is "stuck"', w:2 }
  ];
  var opts = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];

  var wrap = wrapFeature(container,
    '<div class="test-header"><div class="test-header-icon">☠️</div><div><h2>Ama Accumulation Test</h2><p>Measure Your Body\'s Toxic Load — 16 Parameters</p></div></div>' +
    '<div style="padding:1rem 0 0;">' +
    '<div class="info-box gold" style="margin-bottom:1.5rem;">🧪 <strong style="color:var(--brown-dark);">About Ama:</strong> Undigested metabolic waste — the root cause of most chronic disease in Ayurveda. Rate each symptom honestly based on the past 2 weeks.</div>' +
    qs.map(function(q, i) {
      return '<div class="q-row">' +
        '<div class="q-row-label">' + (i + 1) + '. ' + q.q + '</div>' +
        '<div class="pill-group">' +
        opts.map(function(o, j) {
          return '<span class="pill-opt" id="aPill' + i + '_' + j + '" onclick="window._amaPick(' + i + ',' + j + ')">' + o + '</span>';
        }).join('') + '</div></div>';
    }).join('') +
    '<div class="q-row"><p class="q-row-label">⏳ How long have you had these symptoms?</p>' +
    '<div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">' +
    '<input type="number" id="amaDur" placeholder="e.g. 6" min="0" max="600" class="feat-input" style="width:110px;text-align:center;">' +
    '<span style="color:var(--text-muted);">months</span>' +
    '<div style="font-size:0.82rem;color:var(--text-muted);">(Enter 0 if less than 1 month)</div></div></div>' +
    '<button onclick="window._ama()" class="btn-gold" style="width:100%;margin-top:0.75rem;">Calculate Ama Score ✦</button>' +
    '<div id="amaR" style="display:none;margin-top:2rem;"></div></div>'
  );

  var amaSels = {};
  window._amaPick = function(i, j) {
    for (var k = 0; k < opts.length; k++) {
      var el = document.getElementById('aPill' + i + '_' + k);
      if (el) el.classList.remove('active');
    }
    var chosen = document.getElementById('aPill' + i + '_' + j);
    if (chosen) chosen.classList.add('active');
    amaSels[i] = j;
  };

  window._ama = function() {
    var total = 0, max = 0, answered = 0;
    qs.forEach(function(q, i) {
      if (amaSels[i] !== undefined) { total += amaSels[i] * q.w; answered++; }
      max += 4 * q.w;
    });
    if (answered < qs.length) { showToast('Please rate all ' + qs.length + ' symptoms before calculating.', 'error'); return; }
    var durEl = document.getElementById('amaDur');
    var dur = validateNumber(durEl ? (durEl.value || '0') : '0', 0, 600, 'Duration');
    if (dur === null) return;
    var pct = Math.round((total / max) * 100);
    var durText = dur === 0 ? 'less than 1 month' : dur < 3 ? dur + ' month(s) — recent' : dur < 12 ? dur + ' months — established pattern' : Math.floor(dur / 12) + ' year(s) — chronic, deep-rooted';
    var level, c, icon, title, explanation, protocol;
    if (pct <= 20) {
      level = 'Minimal Ama'; c = 'var(--green)'; icon = '✅'; title = 'Body relatively clean — Agni functioning well.';
      explanation = 'Your digestive fire is clearing metabolic waste efficiently. Very little Ama has accumulated. Maintain these healthy habits.';
      protocol = ['Maintain current Dinacharya', 'Monthly Ekadashi or light fasting', 'Triphala churna at bedtime', 'Seasonal Panchakarma for prevention'];
    } else if (pct <= 45) {
      level = 'Mild Ama'; c = '#E8AE0A'; icon = '⚠️'; title = 'Early accumulation — address before it deepens.';
      explanation = 'There is early-stage Ama building up. Your Agni is partially compromised. Now is the ideal time to intervene before symptoms become chronic.';
      protocol = ['Trikatu churna (1/4 tsp) before each meal — 30 days', 'Warm ginger-lemon water every morning on empty stomach', 'Kitchari mono-diet for 3–5 days', 'Reduce cold, heavy, processed foods completely'];
    } else if (pct <= 70) {
      level = 'Moderate Ama'; c = '#E8760A'; icon = '🔶'; title = 'Significant Ama present — urgent digestive focus needed.';
      explanation = 'Ama has significantly accumulated. This is the stage where it begins blocking channels (Srotas) and disrupting organ function. Immediate lifestyle overhaul is essential.';
      protocol = ['Consult Ayurvedic physician for Deepana-Pachana protocol', 'Triphala + Trikatu combination for 45 days', 'Langhana (therapeutic fasting) 1 day/week on fruit + liquids', 'Eliminate all dairy, sugar, fried, and processed foods', 'Consider Virechana or Basti Panchakarma'];
    } else {
      level = 'Heavy Ama (Sama Dosha)'; c = 'var(--red-indian)'; icon = '🔴'; title = 'Chronic, deep Ama — professional Ayurvedic care essential.';
      explanation = 'Ama has deeply lodged in body tissues (Dhatus). This is the root of serious chronic disease. Self-treatment alone is insufficient at this stage.';
      protocol = ['⚠️ Consult an Ayurvedic physician immediately', 'Panchakarma detoxification strongly indicated', 'Eliminate all Ama-promoting foods — strict Ayurvedic diet', 'Begin Ama-Pachana herbs under physician supervision', 'Investigate root cause with comprehensive nadi pariksha'];
    }
    var r = wrap.querySelector('#amaR');
    r.style.display = '';
    r.innerHTML =
      '<div class="result-hero" style="border-color:' + c + '50;background:' + c + '10;">' +
      '<span class="result-big-icon">' + icon + '</span>' +
      '<div style="font-family:var(--font-display);font-size:1.5rem;color:' + c + ';margin-bottom:0.25rem;">' + level + '</div>' +
      '<span class="result-big-score" style="color:' + c + ';">' + pct + '%</span>' +
      '<p style="color:var(--text-muted);max-width:430px;margin:0 auto;">' + title + '</p>' +
      '<div style="margin:1.5rem auto;max-width:360px;">' + scoreBar('Ama Load', pct, c) + '</div></div>' +
      resultCard('📖 What This Means', '<p style="color:var(--text-muted);line-height:1.75;margin-bottom:0.75rem;">' + explanation + '</p><p style="font-size:0.87rem;color:var(--brown-dark);font-weight:600;">⏳ Duration: You have had these symptoms for ' + durText + '.</p>') +
      resultCard('🌿 Your Detox Protocol', listItems(protocol, c), c) +
      '<div class="feat-disclaimer">⚕️ For scores above 45%, consult a qualified Ayurvedic physician for a personalised detox protocol.</div>';
    animateBars(r); fadeIn(r);
    r.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
}

// ════════════════════════════════════════════════════════════════
// FEATURE 7 — RASA MEAL PLANNER
// ════════════════════════════════════════════════════════════════
function renderRasaPlanner(container) {
  var rasas = [
    { id:'sweet',      name:'Madhura',  english:'Sweet',       icon:'🍯', c:'#E8AE0A', dosha:'Balances Vata & Pitta', foods:['Rice, wheat, oats','Milk, ghee','Sweet fruits','Root vegetables'],           effect:'Nourishes all 7 tissues, builds Ojas, calms Vata and Pitta. Most important rasa — must be present.' },
    { id:'sour',       name:'Amla',     english:'Sour',        icon:'🍋', c:'#C8A020', dosha:'Balances Vata',          foods:['Lemon, lime, amla','Curd (moderate)','Tamarind'],                             effect:'Stimulates Agni, enhances absorption, warms the body and mind.' },
    { id:'salty',      name:'Lavana',   english:'Salty',       icon:'🧂', c:'#7A8A90', dosha:'Balances Vata',          foods:['Rock salt (best)','Sea salt (moderate)','Fermented foods'],                    effect:'Maintains electrolyte balance, aids digestion, lubricates channels (Srotas).' },
    { id:'pungent',    name:'Katu',     english:'Pungent',     icon:'🌶️', c:'#C84020', dosha:'Balances Kapha',         foods:['Ginger (fresh & dried)','Black pepper','Garlic, onion','Mustard seeds'],      effect:'Kindles Agni powerfully, clears Ama, improves circulation and metabolism.' },
    { id:'bitter',     name:'Tikta',    english:'Bitter',      icon:'🥬', c:'#2D5E2E', dosha:'Balances Pitta & Kapha', foods:['Bitter gourd (karela)','Turmeric','Fenugreek leaves','Dark leafy greens'],     effect:'Detoxifies blood, reduces inflammation, cools Pitta excess. Anti-microbial.' },
    { id:'astringent', name:'Kashaya',  english:'Astringent',  icon:'🫐', c:'#5A3A7A', dosha:'Balances Pitta & Kapha', foods:['Pomegranate','Lentils and legumes','Unripe banana','Green tea'],               effect:'Tones tissues, reduces excess moisture, supports nutrient absorption.' }
  ];
  var sel = new Set();

  var wrap = wrapFeature(container,
    '<div class="test-header"><div class="test-header-icon">🌾</div><div><h2>Rasa Meal Planner</h2><p>Six Tastes Balance — Daily Meal Logger</p></div></div>' +
    '<div style="padding:1rem 0 0;">' +
    '<div class="result-card" style="margin-bottom:1.25rem;">' +
    '<p style="font-weight:700;color:var(--brown-dark);margin-bottom:0.5rem;">Describe your meal (optional)</p>' +
    '<div style="display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:0.5rem;">' +
    '<input type="text" id="mealName" placeholder="e.g. Lunch at home — rice, dal, sabzi" class="feat-input" style="flex:1;min-width:180px;">' +
    '<select id="mealTime" class="feat-select" style="width:auto;min-width:130px;"><option value="breakfast">Breakfast</option><option value="lunch" selected>Lunch</option><option value="dinner">Dinner</option><option value="snack">Snack</option></select></div></div>' +
    '<p style="color:var(--text-muted);margin-bottom:1.5rem;line-height:1.7;">Every Ayurvedic meal should contain all <strong style="color:var(--brown-dark);">six tastes (Shad Rasa)</strong>. Click each taste you consumed today.</p>' +
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:2rem;">' +
    rasas.map(function(r) {
      return '<div class="rasa-tile" id="rasa_' + r.id + '" onclick="window._rasaSel(\'' + r.id + '\')">' +
        '<span class="rasa-icon">' + r.icon + '</span>' +
        '<span class="rasa-name">' + r.name + '</span>' +
        '<span class="rasa-eng">' + r.english + '</span></div>';
    }).join('') + '</div>' +
    '<button onclick="window._rasaCalc()" class="btn-gold" style="width:100%;">Analyse My Rasa Balance ✦</button>' +
    '<div id="rasaR" style="display:none;margin-top:1.75rem;"></div></div>'
  );

  window._rasaSel = function(id) {
    var r = rasas.find(function(x) { return x.id === id; });
    var el = document.getElementById('rasa_' + id);
    if (sel.has(id)) {
      sel.delete(id);
      el.style.borderColor = 'rgba(212,160,23,0.2)';
      el.style.background  = 'var(--white)';
      el.style.transform   = '';
    } else {
      sel.add(id);
      el.style.borderColor = r.c;
      el.style.background  = r.c + '18';
      el.style.transform   = 'scale(1.05)';
    }
  };

  window._rasaCalc = function() {
    var mealNameRaw = document.getElementById('mealName') ? document.getElementById('mealName').value : '';
    var mealName    = mealNameRaw.trim() ? (validateText(mealNameRaw, 1, 100, 'Meal description') || '') : '';
    var mealTime    = document.getElementById('mealTime') ? document.getElementById('mealTime').value : 'meal';
    var miss = rasas.filter(function(r) { return !sel.has(r.id); });
    var pres = rasas.filter(function(r) { return  sel.has(r.id); });
    var r = wrap.querySelector('#rasaR');
    r.style.display = '';
    r.innerHTML =
      (mealName ? '<div class="info-box gold" style="margin-bottom:1.25rem;"><strong>📋 ' + mealTime.charAt(0).toUpperCase() + mealTime.slice(1) + ':</strong> ' + mealName + '</div>' : '') +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1.5rem;">' +
      '<div class="result-card" style="border-color:rgba(45,94,46,0.3);"><div class="result-card-title" style="color:var(--green);">✅ Present (' + pres.length + ')</div>' +
      (pres.length ? pres.map(function(r) { return '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.4rem;font-size:0.9rem;">' + r.icon + ' <strong>' + r.name + '</strong> <span style="color:var(--text-muted);font-size:0.8rem;">— ' + r.english + '</span></div>'; }).join('') : '<p style="color:var(--text-muted);font-size:0.88rem;">No tastes logged yet.</p>') +
      '</div>' +
      '<div class="result-card" style="border-color:rgba(139,26,26,0.25);"><div class="result-card-title" style="color:var(--red-indian);">❌ Missing (' + miss.length + ')</div>' +
      (miss.length ? miss.map(function(r) { return '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.4rem;font-size:0.9rem;">' + r.icon + ' <strong>' + r.name + '</strong></div>'; }).join('') : '<p style="color:var(--green);font-size:0.88rem;font-weight:600;">All six tastes included! 🎉</p>') +
      '</div></div>' +
      (miss.length > 0 ? resultCard('🍽️ Add to Your Next Meal', miss.map(function(m) {
        return '<div style="margin-bottom:1rem;">' +
          '<div style="font-family:var(--font-display);font-size:0.88rem;color:' + m.c + ';margin-bottom:0.3rem;">' + m.icon + ' ' + m.name + ' (' + m.english + ')</div>' +
          '<div style="font-size:0.84rem;color:var(--text-muted);margin-bottom:0.25rem;">' + m.effect + '</div>' +
          '<div style="font-size:0.82rem;color:var(--brown-dark);">Try: ' + m.foods.slice(0, 2).join(', ') + '</div></div>';
      }).join('<hr style="border:none;border-top:1px solid rgba(212,160,23,0.15);margin:0.75rem 0;">')) : '') +
      resultCard('📊 Balance Score',
        '<div style="text-align:center;margin-bottom:1rem;">' +
        '<div style="font-size:3rem;font-weight:900;color:' + (pres.length === 6 ? 'var(--green)' : pres.length >= 4 ? '#E8AE0A' : 'var(--red-indian)') + ';">' + pres.length + '/6</div>' +
        '<p style="color:var(--text-muted);">' + (pres.length === 6 ? '🎯 Perfect Rasa balance! Your meal is Tridoshic.' : pres.length >= 4 ? '👍 Good balance. Add the missing tastes tomorrow.' : '⚠️ Significant imbalance. Missing tastes affect dosha balance.') + '</p></div>' +
        scoreBar('Rasa Completeness', (pres.length / 6) * 100, pres.length === 6 ? 'var(--green)' : pres.length >= 4 ? '#E8AE0A' : 'var(--red-indian)'),
        pres.length === 6 ? 'var(--green)' : 'var(--gold)');
    animateBars(r); fadeIn(r);
  };
}

// ════════════════════════════════════════════════════════════════
// FEATURE 8 — NAKSHATRA HEALTH CALENDAR
// ════════════════════════════════════════════════════════════════
function renderNakshatra(container) {
  var nakshatras = [
    { name:'Ashwini',         lord:'Ketu',    body:'Head & Brain',          icon:'🐴', element:'Fire',  therapy:'Shiroabhyanga (head oil massage)',              avoid:'Brain-stimulating activities, excess screen time', food:'Cooling foods, brahmi ghee, amla',                  mantra:'Aum Ashwinau Namah' },
    { name:'Bharani',         lord:'Venus',   body:'Head, Eyes',            icon:'⚖️', element:'Earth', therapy:'Netra Tarpana (eye nourishment)',                avoid:'Overeating, excess fats, heated foods',            food:'Light, easy-to-digest foods',                        mantra:'Aum Yamaaya Namah' },
    { name:'Krittika',        lord:'Sun',     body:'Eyes & Neck',           icon:'🔆', element:'Fire',  therapy:'Gandush (oil swishing) for throat',             avoid:'Spicy, Pitta-aggravating foods',                   food:'Cooling milk, fennel, coriander water',              mantra:'Aum Agnidevaya Namah' },
    { name:'Rohini',          lord:'Moon',    body:'Neck & Throat',         icon:'🌺', element:'Earth', therapy:'Warm sesame oil neck massage',                   avoid:'Cold drinks, excessive talking',                   food:'Sweet, nourishing foods, milk',                      mantra:'Aum Prajapataye Namah' },
    { name:'Mrigashira',      lord:'Mars',    body:'Eyes & Eyebrows',       icon:'🦌', element:'Earth', therapy:'Rose water eye wash + triphala eye drops',       avoid:'Excessive reading or screen use',                  food:'Amla, carrot, bilberry — eye foods',                 mantra:'Aum Somaya Namah' },
    { name:'Ardra',           lord:'Rahu',    body:'Eyes, Hair, Joints',    icon:'💧', element:'Water', therapy:'Abhyanga full body + joint care',                avoid:'Cold exposure, swimming in cold water',             food:'Ginger tea, warming spices, sesame',                 mantra:'Aum Rudraya Namah' },
    { name:'Punarvasu',       lord:'Jupiter', body:'Nose, Fingers, Ears',   icon:'⭐', element:'Water', therapy:'Nasya (nasal oil therapy with Anu taila)',       avoid:'Dust, allergens, cold air',                        food:'Warm soups, turmeric milk, honey',                   mantra:'Aum Adityaya Namah' },
    { name:'Pushya',          lord:'Saturn',  body:'Face & Mouth',          icon:'🌼', element:'Water', therapy:'Gandusha (oil pulling) with sesame oil',         avoid:'Cold or raw foods on this day',                    food:'Cooked, warm, easy-to-digest foods',                 mantra:'Aum Brihaspataye Namah' },
    { name:'Ashlesha',        lord:'Mercury', body:'Ears & Joints',         icon:'🐍', element:'Water', therapy:'Karnapoorana (ear oil drops)',                   avoid:'Spicy foods, emotional excess',                    food:'Bitter greens, cooling foods',                       mantra:'Aum Sarpebhyo Namah' },
    { name:'Magha',           lord:'Ketu',    body:'Nose & Chin',           icon:'👑', element:'Fire',  therapy:'Shirodhara for emotional balance',               avoid:'Arrogance, overindulgence',                        food:'Sattvic foods, fruits, milk, honey',                 mantra:'Aum Pitribhyo Namah' },
    { name:'Purva Phalguni',  lord:'Venus',   body:'Heart & Right Hand',    icon:'💞', element:'Fire',  therapy:'Hridaya Tarpana (heart oil care)',               avoid:'Emotional excess, sugar overload',                 food:'Rose, dates, saffron milk',                          mantra:'Aum Bhagaya Namah' },
    { name:'Uttara Phalguni', lord:'Sun',     body:'Heart & Right Hand',    icon:'🌻', element:'Fire',  therapy:'Pranayama — heart-opening practice',             avoid:'Conflict, anger, fasting today',                   food:'Pomegranate, beet, Arjuna herb',                     mantra:'Aum Aryamne Namah' },
    { name:'Hasta',           lord:'Moon',    body:'Hands & Intestines',    icon:'🖐️', element:'Earth', therapy:'Hand marma massage, finger joint care',          avoid:'Cold, damp, stagnant conditions',                  food:'Light cooked food, moong dal, ginger',               mantra:'Aum Savitrebhyo Namah' },
    { name:'Chitra',          lord:'Mars',    body:'Forehead & Neck',       icon:'🔮', element:'Fire',  therapy:'Shiro Abhyanga + sandalwood aromatherapy',       avoid:'Vanity, overwork, midnight sleep',                  food:'Colorful, antioxidant-rich foods',                   mantra:'Aum Tvashtre Namah' },
    { name:'Swati',           lord:'Rahu',    body:'Chest & Lungs',         icon:'🌬️', element:'Air',   therapy:'Pranayama (Nadi Shodhana) for lungs',            avoid:'Wind, cold, travel when ill',                      food:'Lung herbs: vasa, tulsi, licorice',                  mantra:'Aum Vayave Namah' },
    { name:'Vishakha',        lord:'Jupiter', body:'Arms, Breasts & Lymph', icon:'⚡', element:'Fire',  therapy:'Lymphatic Abhyanga massage',                     avoid:'Overambition, skipping meals',                     food:'Figs, dates, nourishing root vegetables',            mantra:'Aum Indragni Namah' },
    { name:'Anuradha',        lord:'Saturn',  body:'Heart & Stomach',       icon:'🌟', element:'Fire',  therapy:'Warm oil abdominal Abhyanga',                    avoid:'Suppressed emotions, cold food',                   food:'Warm digestive spices, cardamom chai',               mantra:'Aum Mitraya Namah' },
    { name:'Jyeshtha',        lord:'Mercury', body:'Neck & Right Arm',      icon:'🦅', element:'Fire',  therapy:'Neck stretching + Nasya therapy',                avoid:'Arrogance, muscular overexertion',                  food:'Brahmi, anti-inflammatory turmeric herbs',           mantra:'Aum Indraya Namah' },
    { name:'Mula',            lord:'Ketu',    body:'Feet & Left Hand',      icon:'🌿', element:'Fire',  therapy:'Padabhyanga (foot oil massage with warm oil)',   avoid:'Harshness, excess standing or walking',             food:'Roots: ashwagandha, shatavari, bala',                mantra:'Aum Nairritaye Namah' },
    { name:'Purva Ashadha',   lord:'Venus',   body:'Thighs & Hips',         icon:'🏹', element:'Fire',  therapy:'Hip and thigh Abhyanga with sesame oil',         avoid:'Overconfidence, excess travel today',               food:'Sesame, dates, nourishing healthy oils',             mantra:'Aum Apam Namah' },
    { name:'Uttara Ashadha',  lord:'Sun',     body:'Thighs & Hips',         icon:'🌞', element:'Earth', therapy:'Grounding yoga asana and pranayama',             avoid:'Impatience, forceful activities',                   food:'Earthy grains: millet, brown rice',                  mantra:'Aum Visvedevebhyo Namah' },
    { name:'Shravana',        lord:'Moon',    body:'Ears & Hearing',        icon:'👂', element:'Air',   therapy:'Karnapoorana (warm sesame oil ear drops)',        avoid:'Loud music, harsh words, noise',                    food:'Vata-calming: warm, oily, sweet foods',              mantra:'Aum Vishnave Namah' },
    { name:'Dhanishtha',      lord:'Mars',    body:'Back & Knees',          icon:'🥁', element:'Air',   therapy:'Back and knee oil therapy + gentle yoga',        avoid:'Cold weather, strenuous exercise',                  food:'Sesame oil, calcium-rich foods, milk',               mantra:'Aum Ashta Vasave Namah' },
    { name:'Shatabhisha',     lord:'Rahu',    body:'Lower Legs & Calves',   icon:'💫', element:'Air',   therapy:'Calf and ankle massage with warm oil',           avoid:'Intoxicants, isolation, excess travel',             food:'Detoxifying herbs: giloy, neem',                     mantra:'Aum Varunaya Namah' },
    { name:'Purva Bhadra',    lord:'Jupiter', body:'Ribs & Left Thigh',     icon:'🔥', element:'Air',   therapy:'Warm rib-cage and diaphragm massage',            avoid:'Fear, anxiety spirals, excess fasting',             food:'Ashwagandha, brahmi, calming warm milk',             mantra:'Aum Ajaikapadaya Namah' },
    { name:'Uttara Bhadra',   lord:'Saturn',  body:'Ribs & Left Ankle',     icon:'🌊', element:'Ether', therapy:'Grounding earth meditation barefoot',            avoid:'Haste, procrastination, cold water',                food:'Triphala, slow-digesting warm foods',                mantra:'Aum Ahirbudhnyaya Namah' },
    { name:'Revati',          lord:'Mercury', body:'Feet & Ankles',         icon:'🐠', element:'Ether', therapy:'Padabhyanga (warm foot bath + oil)',              avoid:'Cold floors, excessive walking, barefoot outside',   food:'Warm, moist, nourishing Vata-calming foods',         mantra:'Aum Pushne Namah' }
  ];

  var now = new Date();
  var lunarDay = Math.floor((now.getTime() / 86400000) % 27);
  var todayNak = nakshatras[lunarDay];
  var moonPhases = ['🌑 New Moon','🌒 Waxing Crescent','🌓 First Quarter','🌔 Waxing Gibbous','🌕 Full Moon','🌖 Waning Gibbous','🌗 Last Quarter','🌘 Waning Crescent'];
  var moonPhase  = moonPhases[Math.floor((lunarDay / 27) * 8) % 8];

  var wrap = wrapFeature(container,
    '<div class="test-header"><div class="test-header-icon">🌙</div><div><h2>Nakshatra Health Calendar</h2><p>Jyotish-Ayurveda — Today\'s Cosmic Health Guide</p></div></div>' +
    '<div style="padding:1rem 0 0;">' +

    // Today's nakshatra hero
    '<div style="background:linear-gradient(135deg,rgba(91,59,154,0.1),rgba(212,160,23,0.06));border:2px solid rgba(91,59,154,0.25);border-radius:var(--radius-xl);padding:2rem;margin-bottom:1.75rem;">' +
    '<div style="display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap;margin-bottom:1.25rem;">' +
    '<div style="font-size:4rem;line-height:1;">' + todayNak.icon + '</div>' +
    '<div><div style="font-family:var(--font-display);font-size:1.6rem;color:#5B3B9A;margin-bottom:0.4rem;">' + todayNak.name + '</div>' +
    '<div style="display:flex;gap:0.5rem;flex-wrap:wrap;">' + pillBadge('Lord: ' + todayNak.lord, '#5B3B9A') + ' ' + pillBadge(todayNak.element + ' Element', 'var(--saffron)') + ' ' + pillBadge(moonPhase, 'var(--gold)') + '</div></div></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">' +
    '<div style="background:rgba(91,59,154,0.06);border-radius:12px;padding:1rem;"><div style="font-weight:700;color:#5B3B9A;font-size:0.85rem;margin-bottom:0.4rem;">🫀 Sensitive Body Part Today</div><div style="font-size:0.93rem;">' + todayNak.body + '</div></div>' +
    '<div style="background:rgba(212,160,23,0.08);border-radius:12px;padding:1rem;"><div style="font-weight:700;color:var(--gold-deep);font-size:0.85rem;margin-bottom:0.4rem;">📿 Mantra of the Day</div><div style="font-size:0.88rem;font-style:italic;">' + todayNak.mantra + '</div></div>' +
    '</div></div>' +

    resultCard('💆 Ideal Therapy Today', '<div style="font-size:1.05rem;color:#5B3B9A;font-weight:600;margin-bottom:0.5rem;">✨ ' + todayNak.therapy + '</div><p style="color:var(--text-muted);">This therapy is especially potent today as Nakshatra energy amplifies treatment to the corresponding body part.</p>', '#5B3B9A') +
    resultCard('🥗 Foods & Herbs', '<div>' + todayNak.food + '</div>', 'var(--green)') +
    resultCard('⚠️ What to Avoid', '<div style="color:var(--red-indian);">' + todayNak.avoid + '</div>', 'var(--red-indian)') +

    // Janma Nakshatra calculator
    '<div class="result-card" style="margin-bottom:1.25rem;">' +
    '<p style="font-weight:700;color:var(--brown-dark);margin-bottom:0.5rem;">🔭 Find Your Janma Nakshatra (Birth Star)</p>' +
    '<p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1rem;">Enter your birth date to calculate your birth Nakshatra (approximate).</p>' +
    '<div style="display:flex;gap:1rem;flex-wrap:wrap;">' +
    '<input type="date" id="nakDate" max="' + now.toISOString().split('T')[0] + '" class="feat-input" style="flex:1;">' +
    '<button onclick="window._calcJanma()" class="btn-gold" style="padding:0.75rem 1.5rem;white-space:nowrap;">Calculate ✦</button></div>' +
    '<div id="janmaR" style="margin-top:1rem;"></div></div>' +

    // All 27 nakshatra grid
    '<div class="result-card"><div class="result-card-title">🌙 Explore All 27 Nakshatras</div>' +
    '<div class="nak-grid">' +
    nakshatras.map(function(n, i) {
      return '<button class="nak-btn ' + (i === lunarDay ? 'active' : '') + '" id="nb_' + i + '" onclick="window._nak(' + i + ')">' + n.icon + ' ' + n.name + '</button>';
    }).join('') + '</div></div>' +
    '<div id="nakR" style="margin-top:1rem;"></div></div>'
  );

  window._calcJanma = function() {
    var dateEl = document.getElementById('nakDate');
    if (!dateEl || !dateEl.value) { showToast('Please enter your birth date to calculate Janma Nakshatra.', 'error'); return; }
    var dob = new Date(dateEl.value);
    if (isNaN(dob.getTime())) { showToast('Invalid date — please enter a valid birth date.', 'error'); return; }
    if (dob > new Date()) { showToast('Birth date cannot be in the future.', 'error'); return; }
    var age = Math.floor((new Date() - dob) / (365.25 * 24 * 3600 * 1000));
    if (age > 120) { showToast('Please enter a valid birth date (not more than 120 years ago).', 'error'); return; }
    var janmaIdx = (((Math.floor(dob.getTime() / 86400000) + 5) % 27) + 27) % 27;
    var jn = nakshatras[janmaIdx];
    var jr = document.getElementById('janmaR');
    jr.innerHTML =
      '<div style="background:rgba(91,59,154,0.06);border:2px solid rgba(91,59,154,0.2);border-radius:12px;padding:1.25rem;margin-top:0.5rem;">' +
      '<div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem;">' +
      '<span style="font-size:2rem;">' + jn.icon + '</span>' +
      '<div><div style="font-family:var(--font-display);color:#5B3B9A;font-size:1.05rem;">Your Janma Nakshatra: ' + jn.name + '</div>' +
      '<div style="font-size:0.82rem;color:var(--text-muted);">Lord: ' + jn.lord + ' · ' + jn.element + ' Element</div></div></div>' +
      '<div style="font-size:0.88rem;color:var(--text-muted);">Your Janma Nakshatra influences your natural body constitution throughout life. The sensitive body area is <strong style="color:var(--brown-dark);">' + jn.body + '</strong>. Recommended daily therapy: <strong style="color:#5B3B9A;">' + jn.therapy + '</strong>.</div></div>';
    fadeIn(jr);
    showToast('Janma Nakshatra: ' + jn.name + '!', 'success');
  };

  window._nak = function(i) {
    var n = nakshatras[i];
    nakshatras.forEach(function(_, j) {
      var b = document.getElementById('nb_' + j);
      if (b) b.className = 'nak-btn' + (j === i ? ' active' : '');
    });
    var r = wrap.querySelector('#nakR');
    r.innerHTML =
      '<div style="background:rgba(91,59,154,0.06);border:2px solid rgba(91,59,154,0.25);border-radius:var(--radius-xl);padding:1.75rem;margin-top:1rem;">' +
      '<div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem;flex-wrap:wrap;">' +
      '<span style="font-size:3rem;">' + n.icon + '</span>' +
      '<div><div style="font-family:var(--font-display);font-size:1.3rem;color:#5B3B9A;">' + n.name + '</div>' +
      pillBadge(n.lord, '#5B3B9A') + ' ' + pillBadge(n.element, 'var(--saffron)') + '</div></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.85rem;">' +
      '<div style="background:rgba(91,59,154,0.04);border-radius:10px;padding:0.85rem;"><div style="font-weight:700;font-size:0.8rem;color:#5B3B9A;margin-bottom:0.3rem;">🫀 Sensitive Region</div><div style="font-size:0.9rem;">' + n.body + '</div></div>' +
      '<div style="background:rgba(212,160,23,0.06);border-radius:10px;padding:0.85rem;"><div style="font-weight:700;font-size:0.8rem;color:var(--gold-deep);margin-bottom:0.3rem;">💆 Ideal Therapy</div><div style="font-size:0.9rem;">' + n.therapy + '</div></div>' +
      '<div style="background:rgba(45,94,46,0.06);border-radius:10px;padding:0.85rem;"><div style="font-weight:700;font-size:0.8rem;color:var(--green);margin-bottom:0.3rem;">🥗 Foods</div><div style="font-size:0.85rem;">' + n.food + '</div></div>' +
      '<div style="background:rgba(139,26,26,0.04);border-radius:10px;padding:0.85rem;"><div style="font-weight:700;font-size:0.8rem;color:var(--red-indian);margin-bottom:0.3rem;">⚠️ Avoid</div><div style="font-size:0.85rem;">' + n.avoid + '</div></div>' +
      '</div>' +
      '<div style="margin-top:0.85rem;font-style:italic;font-size:0.85rem;color:var(--text-muted);text-align:center;">📿 ' + n.mantra + '</div></div>';
    fadeIn(r);
    r.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
}

// ════════════════════════════════════════════════════════════════
// FEATURE 9 — PRANAYAMA PRESCRIPTION
// ════════════════════════════════════════════════════════════════
function renderPranayama(container) {
  var conditions = [
    { id:'anxiety',    label:'Anxiety / Panic attacks',               recommended:['brahmari','vata'] },
    { id:'hypertension', label:'High Blood Pressure',                 recommended:['pitta','brahmari'] },
    { id:'asthma',     label:'Asthma / Breathlessness',               recommended:['vata','pitta'], avoid:['kapalbhati'] },
    { id:'insomnia',   label:'Insomnia / Poor sleep',                  recommended:['brahmari','vata'] },
    { id:'fatigue',    label:'Chronic fatigue / Low energy',           recommended:['kapha','vata'] },
    { id:'weightgain', label:'Weight management / Sluggish metabolism', recommended:['kapalbhati','kapha'] },
    { id:'acidreflux', label:'Acidity / Acid reflux',                  recommended:['pitta'], avoid:['kapalbhati'] },
    { id:'depression', label:'Depression / Low mood',                  recommended:['kapha','brahmari'] },
    { id:'sinusitis',  label:'Sinusitis / Nasal congestion',           recommended:['kapha','kapalbhati'] },
    { id:'migraine',   label:'Migraine / Chronic headache',            recommended:['pitta','brahmari'], avoid:['kapalbhati'] },
    { id:'none',       label:'No specific condition — general wellness', recommended:['vata','pitta','kapha','brahmari'] }
  ];
  var prescriptions = [
    { id:'vata',       label:'Vata Balance',   desc:'Anxiety, insomnia, irregular breathing, stress', icon:'🌬️', c:'#6B8CBA',
      name:'Sama Vritti Pranayama', sanskrit:'सम वृत्ति प्राणायाम', english:'Equal Ratio Breathing',
      duration:'10–15 minutes', ratio:'4-4-4 (Inhale-Hold-Exhale)', rounds:'21 rounds or 15 minutes',
      steps:['Sit in Sukhasana or Padmasana, spine tall, palms on knees','Close eyes gently, breathe naturally for 1 minute to settle','Begin: Inhale slowly through the nose — count 1-2-3-4','Hold the breath comfortably — count 1-2-3-4','Exhale slowly through the nose — count 1-2-3-4','This is one cycle. Repeat without pause or strain','Practice 21 cycles minimum. Increase to 108 over time'],
      benefits:['Balances the nervous system','Reduces Vata-type anxiety and racing thoughts','Regulates irregular breathing patterns','Improves sleep quality significantly','Grounds scattered mental energy'],
      bestTime:'Morning and evening. Especially before bed for insomnia.', caution:'Do not force the breath. Keep it comfortable. If dizzy, breathe normally.' },
    { id:'pitta',      label:'Pitta Cooling',  desc:'Anger, acidity, migraines, hyperacidity, skin heat', icon:'❄️', c:'#4A8C9A',
      name:'Sheetali / Sheetkari Pranayama', sanskrit:'शीतली / शीत्कारी प्राणायाम', english:'Cooling Breath',
      duration:'5–10 minutes', ratio:'8:8 (Inhale-Exhale)', rounds:'16–32 rounds',
      steps:['Sit comfortably with spine erect','Roll your tongue into a tube (Sheetali) — OR press tongue to teeth (Sheetkari)','Inhale through the rolled tongue or teeth — feel cooling air','Close the mouth, hold briefly','Exhale slowly through the nose','Repeat 16 times minimum. This is one set','Practice 2–3 sets total'],
      benefits:['Rapidly cools the body and Pitta','Reduces anger, frustration, and impatience','Lowers blood pressure naturally','Relieves skin inflammation and rashes','Excellent for migraines and eye heat','Soothes acid reflux and GI inflammation'],
      bestTime:'Morning before food. Anytime during stress or anger.', caution:'Avoid in cold weather or if prone to cold/cough. Avoid if asthma present.' },
    { id:'kapha',      label:'Kapha Activation', desc:'Lethargy, congestion, weight gain, depression', icon:'⚡', c:'#8A6D20',
      name:'Bhastrika Pranayama', sanskrit:'भस्त्रिका प्राणायाम', english:'Bellows Breath',
      duration:'5–10 minutes', ratio:'Forceful and equal (1:1)', rounds:'3 sets of 20–30 breaths',
      steps:['Sit in Padmasana or Sukhasana. Keep spine erect','Breathe in deeply and rapidly through both nostrils','Exhale forcefully and rapidly — equal to inhalation','Both inhale AND exhale are active and forceful','Start with 20 breaths per set. Rest 30 seconds between sets','Work up to 3 sets of 30. Maximum 5–10 sets for advanced','End with one deep inhale, hold, slow exhale'],
      benefits:['Powerfully activates Kapha metabolism','Clears respiratory congestion immediately','Boosts energy and combats depression','Strengthens lungs and respiratory system','Generates internal heat to counter cold Kapha','Improves circulation and lymphatic drainage'],
      bestTime:'Early morning, empty stomach. Not at night — very energising.', caution:'Avoid in pregnancy, hernia, hypertension, epilepsy, heart disease. Stop if dizzy.' },
    { id:'brahmari',   label:'Stress & Sleep', desc:'Anxiety, high BP, tinnitus, insomnia, overthinking', icon:'🐝', c:'#6B5BA0',
      name:'Brahmari Pranayama', sanskrit:'भ्रामरी प्राणायाम', english:'Humming Bee Breath',
      duration:'10–20 minutes', ratio:'5:7 (Inhale-Hum)', rounds:'11–21 rounds',
      steps:['Sit in Sukhasana, eyes closed, face relaxed','Plug ears gently with index fingers (Shanmukhi Mudra)','Take a deep slow inhalation through the nose','As you exhale, make a sustained humming sound "Mmmmm" like a bee','Feel the vibration resonate in the skull, sinuses, and chest','One complete breath is one round. Practice 11 minimum','As vibration deepens, a profound stillness emerges'],
      benefits:['Instantly calms the mind — best for anxiety','Reduces blood pressure and racing heart','Improves concentration and memory','Beneficial for tinnitus (ringing ears)','Dramatically enhances sleep quality','Stimulates vagus nerve — activates calm'],
      bestTime:'Any time — especially before meditation or sleep. In acute stress.', caution:'Safe for almost all. Avoid if ear infection. Do not strain the throat.' },
    { id:'kapalbhati', label:'Detox & Weight', desc:'Sluggish metabolism, Ama removal, weight management', icon:'✨', c:'#E8760A',
      name:'Kapalabhati Pranayama', sanskrit:'कपालभाती प्राणायाम', english:'Skull Shining Breath',
      duration:'5–10 minutes', ratio:'Passive inhale, forceful exhale', rounds:'3 sets of 30–60',
      steps:['Sit in Sukhasana with hands in Gyana Mudra (thumb + index touching)','Take a normal breath in to prepare','FORCEFULLY exhale through the nose — draw navel sharply toward spine','Inhalation is PASSIVE — it happens automatically as belly relaxes','Focus only on the sharp, pumping exhalation — 1 pump per second','Do 30 pumps. Pause for 30 seconds. Breathe normally','Repeat for 3 sets. Work up gradually to 60 pumps per set','After practice: sit still, observe the profound clarity'],
      benefits:['Clears toxins from respiratory system','Stimulates liver, pancreas, spleen','Activates and strengthens digestive fire','Sharpens mental clarity (\"Skull Shining\")','Tones abdominal muscles and organs','Reduces blood sugar in Type 2 diabetes'],
      bestTime:'Early morning, empty stomach. Do NOT do at night — very stimulating.', caution:'Avoid: pregnancy, hernia, slipped disc, high blood pressure, epilepsy. Stop if dizzy.' }
  ];

  window._breathIntervals = window._breathIntervals || {};

  var wrap = wrapFeature(container,
    '<div class="test-header"><div class="test-header-icon">🌬️</div><div><h2>Pranayama Prescription</h2><p>Classical Breathing Therapies — Condition-Based Prescription</p></div></div>' +
    '<div style="padding:1rem 0 0;">' +
    '<div class="result-card" style="margin-bottom:1.5rem;">' +
    '<p style="font-weight:700;color:var(--brown-dark);margin-bottom:1rem;">Step 1: Select your current health concern(s)</p>' +
    '<div class="cond-tag-grid">' +
    conditions.map(function(cond) {
      return '<div class="cond-tag-item" id="cond_' + cond.id + '" onclick="window._toggleCond(\'' + cond.id + '\')">' + cond.label + '</div>';
    }).join('') + '</div>' +
    '<button onclick="window._prescribe()" class="btn-gold" style="width:100%;">Get My Pranayama Prescription ✦</button></div>' +
    '<div id="pranaR" style="display:none;"></div></div>'
  );

  var selectedConds = new Set();
  window._toggleCond = function(id) {
    var el = document.getElementById('cond_' + id);
    if (selectedConds.has(id)) { selectedConds.delete(id); el.classList.remove('active'); }
    else { selectedConds.add(id); el.classList.add('active'); }
  };

  window._prescribe = function() {
    if (selectedConds.size === 0) { showToast('Please select at least one health concern to get your prescription.', 'error'); return; }
    var avoidIds = new Set(), recommendIds = new Set();
    selectedConds.forEach(function(cid) {
      var cond = conditions.find(function(c) { return c.id === cid; });
      if (cond) {
        (cond.recommended || []).forEach(function(r) { recommendIds.add(r); });
        (cond.avoid || []).forEach(function(a) { avoidIds.add(a); });
      }
    });
    var recommended = prescriptions.filter(function(p) { return recommendIds.has(p.id) && !avoidIds.has(p.id); });
    var avoided     = prescriptions.filter(function(p) { return avoidIds.has(p.id); });
    var r = wrap.querySelector('#pranaR');
    r.style.display = '';
    r.innerHTML =
      (avoided.length > 0 ? '<div class="info-box red" style="margin-bottom:1.5rem;">⚠️ <strong>Contraindicated for your conditions:</strong> ' + avoided.map(function(p) { return p.name; }).join(', ') + ' — these are excluded from your prescription.</div>' : '') +
      (recommended.length === 0 ? '<div class="info-box gold">No specific pranayama found for your selection. Try selecting fewer conditions, or choose "General Wellness".</div>' : '') +
      recommended.map(function(p) {
        return '<div style="background:' + p.c + '10;border:2px solid ' + p.c + '40;border-radius:var(--radius-xl);padding:2rem;margin-bottom:1.5rem;">' +
          '<div style="text-align:center;margin-bottom:1.5rem;">' +
          '<span style="font-size:3rem;display:block;margin-bottom:0.5rem;">' + p.icon + '</span>' +
          '<div style="font-family:var(--font-display);font-size:1.4rem;color:' + p.c + ';">' + p.name + '</div>' +
          '<div style="color:var(--text-muted);font-size:0.9rem;margin-top:0.25rem;">' + p.sanskrit + ' · ' + p.english + '</div>' +
          '<div style="display:flex;justify-content:center;gap:0.75rem;flex-wrap:wrap;margin-top:0.75rem;">' + pillBadge('⏱ ' + p.duration, p.c) + ' ' + pillBadge('🔄 ' + p.rounds, 'var(--gold-deep)') + '</div></div>' +

          // Breathing timer
          '<div style="text-align:center;margin-bottom:1.5rem;">' +
          '<div id="breathRing_' + p.id + '" class="breath-ring" style="border-color:' + p.c + '50;">' +
          '<div class="breath-text-wrap" style="color:' + p.c + ';"><span class="breath-phase" id="breathPhase_' + p.id + '">READY</span><span class="breath-count" id="breathCount_' + p.id + '">—</span></div></div>' +
          '<button id="breathBtn_' + p.id + '" onclick="window._startBreath(\'' + p.id + '\')" style="padding:0.75rem 2rem;border-radius:50px;background:linear-gradient(135deg,' + p.c + ',' + p.c + 'cc);border:none;color:white;font-family:var(--font-body);font-size:0.95rem;font-weight:700;cursor:pointer;margin-top:0.5rem;">▶ Start Breathing Guide</button></div>' +

          resultCard('📋 Step-by-Step Practice', p.steps.map(function(s, i) {
            return '<div style="display:flex;gap:0.75rem;margin-bottom:0.5rem;">' +
              '<span style="background:' + p.c + '20;color:' + p.c + ';border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:700;flex-shrink:0;">' + (i + 1) + '</span>' +
              '<span style="font-size:0.9rem;">' + s + '</span></div>';
          }).join(''), p.c) +
          resultCard('✨ Benefits', listItems(p.benefits, p.c), p.c) +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;">' +
          resultCard('🌅 Best Time', '<p style="color:var(--text-muted);">' + p.bestTime + '</p>', 'var(--gold)') +
          resultCard('⚠️ Caution', '<p style="color:var(--text-muted);">' + p.caution + '</p>', 'var(--red-indian)') + '</div></div>';
      }).join('');
    fadeIn(r); r.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  var BREATH_PATTERNS = {
    vata:      [{ phase:'INHALE', dur:4 }, { phase:'HOLD', dur:4 }, { phase:'EXHALE', dur:4 }],
    pitta:     [{ phase:'INHALE', dur:8 }, { phase:'EXHALE', dur:8 }],
    kapha:     [{ phase:'INHALE', dur:2 }, { phase:'EXHALE', dur:2 }],
    brahmari:  [{ phase:'INHALE', dur:5 }, { phase:'HUM ◈', dur:7 }],
    kapalbhati:[{ phase:'EXHALE!', dur:1 }, { phase:'INHALE', dur:1 }]
  };

  window._startBreath = function(id) {
    if (window._breathIntervals[id]) { clearInterval(window._breathIntervals[id]); delete window._breathIntervals[id]; }
    var btn = document.getElementById('breathBtn_' + id);
    var ring = document.getElementById('breathRing_' + id);
    var phaseEl = document.getElementById('breathPhase_' + id);
    var countEl = document.getElementById('breathCount_' + id);
    if (!ring) return;
    btn.textContent = '⏹ Stop';
    btn.onclick = function() {
      clearInterval(window._breathIntervals[id]);
      delete window._breathIntervals[id];
      btn.textContent = '▶ Start Breathing Guide';
      btn.onclick = function() { window._startBreath(id); };
      phaseEl.textContent = 'READY';
      countEl.textContent = '—';
      ring.className = 'breath-ring';
    };
    var pattern = BREATH_PATTERNS[id] || BREATH_PATTERNS.vata;
    var pIdx = 0, counter = 0;
    function tick() {
      var cur = pattern[pIdx];
      counter++;
      phaseEl.textContent = cur.phase;
      countEl.textContent = counter;
      ring.classList.remove('inhale', 'exhale', 'hold');
      if (cur.phase.includes('INHALE')) ring.classList.add('inhale');
      else if (cur.phase.includes('EXHALE') || cur.phase.includes('HUM')) ring.classList.add('exhale');
      else ring.classList.add('hold');
      if (counter >= cur.dur) { counter = 0; pIdx = (pIdx + 1) % pattern.length; }
    }
    window._breathIntervals[id] = setInterval(tick, 1000); tick();
  };
}

// ════════════════════════════════════════════════════════════════
// FEATURE 10 — HERB–DRUG INTERACTION CHECKER
// ════════════════════════════════════════════════════════════════
function renderHerbChecker(container) {
  var interactions = {
    warfarin:  { drug:'Warfarin (blood thinner)',
      safe:    [{ herb:'Haritaki',           use:'Digestive support — use in small doses only, monitor INR closely' }],
      monitor: [{ herb:'Ashwagandha',        reason:'May mildly increase anticoagulant effect — monitor INR monthly' },
                { herb:'Turmeric / Curcumin', reason:'High-dose turmeric has mild antiplatelet properties — culinary amounts safe' },
                { herb:'Ginger',             reason:'Large doses may inhibit platelet aggregation — limit to under 2g/day' }],
      avoid:   [{ herb:'Triphala (high dose)', reason:'May increase bleeding risk due to Amalaki content — strict monitoring needed' },
                { herb:'Guggulu',            reason:'Has fibrinolytic effects — may potentiate warfarin significantly' },
                { herb:'Fenugreek',          reason:'Has coumarin-like activity — avoid concurrent high-dose use' }] },
    metformin: { drug:'Metformin (diabetes)',
      safe:    [{ herb:'Ashwagandha', use:'Adaptogenic support, generally safe alongside metformin' },
                { herb:'Brahmi',     use:'Cognitive support, no significant interaction reported' },
                { herb:'Triphala',   use:'Digestive support, may support glycemic health synergistically' }],
      monitor: [{ herb:'Bitter Melon (Karela)', reason:'Blood-sugar lowering — may potentiate hypoglycaemia, monitor closely' },
                { herb:'Fenugreek',             reason:'Can lower blood sugar — adjust metformin dose if adding regularly' },
                { herb:'Gurmar (Gymnema)',       reason:'Strong anti-diabetic herb — may require dose reduction of metformin' }],
      avoid:   [{ herb:'Shilajit (unpurified)', reason:'Heavy metal content risk in unverified products — only use purified, certified Shilajit' }] },
    ssri:      { drug:'SSRIs (antidepressants)',
      safe:    [{ herb:'Ashwagandha', use:'Adaptogenic support, generally compatible — discuss with psychiatrist' },
                { herb:'Shatavari',   use:'Hormonal and nervous system nourishment, gentle herb' }],
      monitor: [{ herb:'Brahmi (Bacopa)', reason:'May have mild serotonergic activity — monitor for serotonin syndrome signs' },
                { herb:'Shankhpushpi',    reason:'CNS effects may interact — start low, monitor mood carefully' },
                { herb:'Jatamansi',       reason:'Sedative properties may be additive — avoid with sedating SSRIs' }],
      avoid:   [{ herb:"St. John's Wort", reason:'CONTRAINDICATED with all SSRIs — serious risk of serotonin syndrome' },
                { herb:'High-dose Valerian', reason:'CNS depressant — may cause dangerous sedation when combined' }] },
    thyroid:   { drug:'Levothyroxine (thyroid)',
      safe:    [{ herb:'Shatavari', use:'Nourishing adaptogen — take 4+ hours apart from levothyroxine' },
                { herb:'Brahmi',    use:'Cognitive support, no significant thyroid hormone interaction' }],
      monitor: [{ herb:'Ashwagandha', reason:'May increase T4 levels — monitor thyroid function if using regularly' },
                { herb:'Guggulu',     reason:'Contains guggulsterone which may affect thyroid hormone metabolism' },
                { herb:'Triphala',    reason:'Amalaki may affect thyroid — space 4+ hours from levothyroxine' }],
      avoid:   [{ herb:'Soy (isoflavones)',            reason:'Can reduce levothyroxine absorption — avoid 2 hours around dosing' },
                { herb:'Calcium-heavy herb combinations', reason:'Impairs absorption of thyroid hormone — space carefully' }] },
    statins:   { drug:'Statins (cholesterol)',
      safe:    [{ herb:'Triphala',         use:'Mild lipid support, safe with statins in normal doses' },
                { herb:'Turmeric (culinary)', use:'Anti-inflammatory benefit — culinary amounts perfectly safe' }],
      monitor: [{ herb:'Guggulu',       reason:'Has lipid-lowering activity — may potentiate statins, over-reduce LDL' },
                { herb:'Garlic (high dose)', reason:'May increase statin effect — monitor LDL levels if using therapeutic garlic' }],
      avoid:   [{ herb:'Grapefruit / Pomelo',    reason:'Inhibits CYP3A4 enzyme — drastically increases statin blood levels, risk of muscle damage' },
                { herb:'High-dose Niacin herbs', reason:'Combined with statins may increase risk of myopathy' }] },
    aspirin:   { drug:'Aspirin (pain/blood thinner)',
      safe:    [{ herb:'Brahmi',    use:'Cognitive support — no interaction with aspirin at normal doses' },
                { herb:'Shatavari', use:'Hormone and digestive support — safe with aspirin' }],
      monitor: [{ herb:'Boswellia (Shallaki)',  reason:'Anti-inflammatory — additive effect with aspirin, monitor GI tolerance' },
                { herb:'High-dose Ginger',      reason:'Antiplatelet activity similar to aspirin — additive bleeding risk at high doses' },
                { herb:'Turmeric (high dose)',   reason:'Antiplatelet and GI effects — monitor for GI bleeding with chronic aspirin' }],
      avoid:   [{ herb:'Willow Bark',           reason:'Contains salicin (natural aspirin) — salicylate toxicity risk when combined' },
                { herb:'Garlic + Ginkgo combo', reason:'Combined antiplatelet effect — significant bleeding risk with aspirin' }] }
  };

  var wrap = wrapFeature(container,
    '<div class="test-header"><div class="test-header-icon">💊</div><div><h2>Herb–Drug Interaction Checker</h2><p>Ayurvedic Safety Tool — Know Before You Combine</p></div></div>' +
    '<div style="padding:1rem 0 0;">' +
    '<div class="info-box red" style="margin-bottom:1.75rem;">⚕️ <strong>Medical Disclaimer:</strong> This tool provides general guidance only. Always consult your physician and Ayurvedic specialist before combining herbs with prescription medication.</div>' +
    '<p style="font-weight:700;color:var(--brown-dark);margin-bottom:1.25rem;">Select your medication category:</p>' +
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.85rem;margin-bottom:1.75rem;">' +
    Object.entries(interactions).map(function(e) {
      var key = e[0], val = e[1];
      var parts = val.drug.split('(');
      return '<div class="drug-btn" id="hBtn_' + key + '" onclick="window._herb(\'' + key + '\')">' +
        '<div class="drug-btn-name">' + parts[0].trim() + '</div>' +
        '<div class="drug-btn-type">' + (parts[1] ? parts[1].replace(')', '') : '') + '</div></div>';
    }).join('') + '</div>' +
    '<div class="result-card" style="margin-bottom:1.75rem;">' +
    '<p style="font-weight:700;color:var(--brown-dark);margin-bottom:0.5rem;">Check a custom herb + drug combination</p>' +
    '<div style="display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:0.75rem;">' +
    '<input type="text" id="customDrug" placeholder="Drug name (e.g. Aspirin)" class="feat-input" style="flex:1;" maxlength="60">' +
    '<input type="text" id="customHerb" placeholder="Herb name (e.g. Boswellia)" class="feat-input" style="flex:1;" maxlength="60">' +
    '<button onclick="window._checkCustom()" class="btn-gold" style="padding:0.75rem 1.5rem;white-space:nowrap;">Submit</button></div>' +
    '<p style="font-size:0.82rem;color:var(--text-muted);">💡 General rule: separate all herbs by 2 hours from pharmaceuticals. Always inform your physician.</p></div>' +
    '<div id="herbR" style="display:none;"></div></div>'
  );

  window._checkCustom = function() {
    var drug = validateText(document.getElementById('customDrug').value, 2, 60, 'Drug name');
    if (!drug) return;
    var herb = validateText(document.getElementById('customHerb').value, 2, 60, 'Herb name');
    if (!herb) return;
    showToast('Safety query noted for "' + herb + '" with "' + drug + '". Always consult your physician before combining.', 'warning');
    document.getElementById('customDrug').value = '';
    document.getElementById('customHerb').value = '';
  };

  window._herb = function(key) {
    var info = interactions[key];
    Object.keys(interactions).forEach(function(k) {
      var b = document.getElementById('hBtn_' + k);
      if (b) b.classList.remove('active');
    });
    document.getElementById('hBtn_' + key).classList.add('active');
    var r = wrap.querySelector('#herbR');
    r.style.display = '';
    r.innerHTML =
      '<div style="font-family:var(--font-display);font-size:1.1rem;color:var(--brown-dark);margin-bottom:1.25rem;">💊 ' + info.drug + '</div>' +
      resultCard('✅ Generally Safe Herbs', info.safe.map(function(h) {
        return '<div style="margin-bottom:0.75rem;"><div style="font-weight:700;color:var(--green);margin-bottom:0.2rem;">🌿 ' + h.herb + '</div><div style="font-size:0.88rem;color:var(--text-muted);">' + h.use + '</div></div>';
      }).join('<hr style="border:none;border-top:1px solid rgba(45,94,46,0.15);margin:0.5rem 0;">'), 'var(--green)') +
      resultCard('⚠️ Use with Monitoring', info.monitor.map(function(h) {
        return '<div style="margin-bottom:0.75rem;"><div style="font-weight:700;color:#E8AE0A;margin-bottom:0.2rem;">⚠️ ' + h.herb + '</div><div style="font-size:0.88rem;color:var(--text-muted);">' + h.reason + '</div></div>';
      }).join('<hr style="border:none;border-top:1px solid rgba(232,174,10,0.15);margin:0.5rem 0;">'), '#E8AE0A') +
      resultCard('🚫 Avoid This Combination', info.avoid.map(function(h) {
        return '<div style="margin-bottom:0.75rem;"><div style="font-weight:700;color:var(--red-indian);margin-bottom:0.2rem;">🚫 ' + h.herb + '</div><div style="font-size:0.88rem;color:var(--text-muted);">' + h.reason + '</div></div>';
      }).join('<hr style="border:none;border-top:1px solid rgba(139,26,26,0.15);margin:0.5rem 0;">'), 'var(--red-indian)') +
      '<div class="feat-disclaimer">⚕️ This tool does not replace professional medical advice. Always consult both your physician and Ayurvedic practitioner before combining herbs with medications.</div>';
    fadeIn(r); r.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
}

// ════════════════════════════════════════════════════════════════
// FEATURE 11 — PANCHAKARMA READINESS
// ════════════════════════════════════════════════════════════════
function renderPanchakarma(container) {
  var questions = [
    { q:'How long have you been experiencing your current health issue?', opts:['Less than 1 month','1–3 months','3–12 months','Over 1 year','Chronic — many years'], sc:[1,2,3,3,4] },
    { q:'How is your current digestive strength (Agni)?', opts:['Very weak — frequently unwell after eating','Weak — often bloated or constipated','Moderate — some irregularity','Good — regular digestion','Strong — digests most foods well'], sc:[0,1,2,3,4] },
    { q:'What is your current body type / constitution?', opts:['Very thin or underweight','Thin, Vata-type','Medium, well-proportioned','Moderately overweight','Well-built or heavy, Kapha-type'], sc:[0,1,3,2,2] },
    { q:'Do you have any of these contraindications?', opts:['None of the below','Pregnancy or planning pregnancy','Age under 12 or over 80','Active cancer or radiation therapy','Severe heart or kidney disease'], sc:[4,0,1,0,0] },
    { q:'How is your mental and emotional state currently?', opts:['Very unstable — grief, trauma, crisis','Anxious or highly stressed','Moderate stress','Generally stable','Calm, grounded, and settled'], sc:[0,1,2,3,4] },
    { q:'Can you commit to the full Panchakarma protocol?', opts:['No — impossible to take time off','Very difficult — extreme work pressure','Challenging but possible for 1 week','I can take 2 weeks off','Yes — I can commit fully for 3–4 weeks'], sc:[0,1,2,3,4] },
    { q:'Have you done any Ayurvedic preparation (Poorvakarma)?', opts:['None — starting fresh','Only basic dietary changes','Oleation (Snehapana) and steam','Full Poorvakarma with physician guidance','Previous Panchakarma experience'], sc:[1,2,3,4,4] },
    { q:'What is your diet like currently?', opts:['Processed, fast food, irregular meals','Mixed — some healthy, some junk','Mostly home-cooked but not Ayurvedic','Home-cooked, sattvic, regular meals','Strictly Ayurvedic diet already'], sc:[0,1,2,3,4] }
  ];

  var wrap = wrapFeature(container,
    '<div class="test-header"><div class="test-header-icon">🧘</div><div><h2>Panchakarma Readiness</h2><p>8 Clinical Parameters — Am I Ready for Panchakarma?</p></div></div>' +
    '<div style="padding:1rem 0 0;">' +
    '<div class="info-box gold" style="margin-bottom:1.75rem;">🌿 <strong style="color:var(--brown-dark);">About Panchakarma:</strong> The five purification therapies of Ayurveda (Vamana, Virechana, Basti, Nasya, Raktamokshana). The most powerful healing and rejuvenation system — requires proper preparation and physician supervision.</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1.5rem;">' +
    '<div><label class="feat-label">Your Age</label><input type="number" id="pkAge" placeholder="e.g. 35" min="1" max="120" class="feat-input"></div>' +
    '<div><label class="feat-label">Current Medications (if any)</label><input type="text" id="pkMeds" placeholder="e.g. Metformin, Thyronorm" class="feat-input" maxlength="200"></div></div>' +
    questions.map(function(q, i) {
      return '<div class="q-row"><div class="q-row-label">' + (i + 1) + '. ' + q.q + '</div>' +
        '<div class="q-radio-opts">' +
        q.opts.map(function(o, j) {
          return '<label class="q-radio-label" id="pkl_' + i + '_' + j + '">' +
            '<input type="radio" name="pk' + i + '" value="' + j + '" style="accent-color:var(--gold);" onchange="document.querySelectorAll(\'[id^=\\\'pkl_' + i + '_\\\']\').forEach(function(l){l.classList.remove(\'checked\')});this.closest(\'.q-radio-label\').classList.add(\'checked\')">' +
            '<span>' + o + '</span></label>';
        }).join('') + '</div></div>';
    }).join('') +
    '<button onclick="window._pk()" class="btn-gold" style="width:100%;margin-top:0.75rem;">Assess My Readiness ✦</button>' +
    '<div id="pkR" style="display:none;margin-top:2rem;"></div></div>'
  );

  window._pk = function() {
    var ageVal = validateNumber(document.getElementById('pkAge') ? document.getElementById('pkAge').value : '', 1, 120, 'Age');
    if (ageVal === null) return;
    var medsRaw = document.getElementById('pkMeds') ? document.getElementById('pkMeds').value : '';
    var meds = medsRaw.trim() ? (validateText(medsRaw, 1, 200, 'Medications') || '') : '';
    var total = 0, answered = 0;
    questions.forEach(function(q, i) {
      var s = wrap.querySelector('input[name="pk' + i + '"]:checked');
      if (s) { total += q.sc[parseInt(s.value)]; answered++; }
    });
    if (answered < questions.length) { showToast('Please answer all ' + questions.length + ' questions to get your readiness assessment.', 'error'); return; }
    var maxScore = 32;
    var pct = Math.round((total / maxScore) * 100);
    var level, c, icon, title, detail, therapies, nextSteps;
    if (ageVal < 12 || ageVal > 80) {
      level = 'Age Restricted'; c = 'var(--red-indian)'; icon = '⚠️'; title = 'Panchakarma has age restrictions';
      detail = 'Panchakarma is generally not recommended for children under 12 or adults over 80 in full intensity. Gentle supportive therapies (Abhyanga, Nasya) may still be beneficial under physician supervision.';
      therapies = ['Gentle external therapies: Abhyanga, Shirodhara', 'Appropriate herbs for age group', 'Dietary modifications only'];
      nextSteps = ['Consult an Ayurvedic physician for age-appropriate therapy', 'Focus on Dinacharya and proper diet', 'Gentle Yoga and Pranayama suitable for age'];
    } else if (pct >= 80) {
      level = 'Highly Ready'; c = 'var(--green)'; icon = '🧘'; title = 'Excellent Panchakarma candidate — proceed with full protocol';
      detail = 'Your constitution, Agni, mental state, and commitment are all well-prepared. This is an ideal time to undergo Panchakarma. You have a strong foundation for deep healing.';
      therapies = ['Virechana (Pitta cleansing via purgation) — excellent for liver, skin, blood', 'Basti (Vata balancing via medicated enema) — best for colon and nervous system', 'Nasya (head and neck cleansing) — for sinus, migraine, mental clarity'];
      nextSteps = ['Find a qualified Ayurvedic physician — the timing is right', 'Begin Poorvakarma: 7 days internal oleation (Snehapana) + steam', 'Arrange 3–4 weeks off work for the full Panchakarma programme'];
    } else if (pct >= 55) {
      level = 'Conditionally Ready'; c = '#E8AE0A'; icon = '⚠️'; title = 'Some preparation needed before Panchakarma';
      detail = 'You have good potential for Panchakarma but need some foundational work first — strengthening digestion, adjusting diet, or resolving contraindications.';
      therapies = ['Abhyanga + Swedana (oil massage + steam) — begin with external therapies', 'Basti (gentle enemas) — good starting point for most imbalances', 'Nasya — safe and gentle, great first Panchakarma therapy'];
      nextSteps = ['Consult an Ayurvedic physician to address your contraindications', 'Follow a 30-day Ayurvedic diet programme (Dinacharya + Ritucharya)', 'Revisit full Panchakarma in 6–8 weeks after preparation'];
    } else if (pct >= 30) {
      level = 'Not Yet Ready'; c = 'var(--saffron)'; icon = '🌱'; title = 'Preliminary healing needed before Panchakarma';
      detail = 'Your system needs strengthening before Panchakarma. Strong detoxification on a weak system can cause harm. Focus on building strength (Brimhana therapy) first.';
      therapies = ['Dinacharya (daily routine) — the foundation of all healing', 'Agni kindling: Trikatu, ginger, digestive herbs daily', 'Gentle Abhyanga massage + lifestyle work'];
      nextSteps = ['Do not attempt Panchakarma at this stage', 'Work with an Ayurvedic practitioner for 3–6 months', 'Focus on diet, sleep, digestion, and emotional stability first'];
    } else {
      level = 'Contraindicated'; c = 'var(--red-indian)'; icon = '🚫'; title = 'Panchakarma is contraindicated at this time';
      detail = 'Current health, contraindications, or extreme weakness make Panchakarma unsafe. Appropriate medical treatment must come first.';
      therapies = ['Gentle supportive care only', 'Appropriate medical treatment for acute conditions', 'Focus on nutrition, hydration, and rest'];
      nextSteps = ['Do not attempt any form of Panchakarma', 'Seek conventional medical care for acute conditions first', 'After stabilisation, begin gentle Ayurvedic lifestyle adjustments'];
    }
    var r = wrap.querySelector('#pkR');
    r.style.display = '';
    r.innerHTML =
      '<div class="result-hero" style="border-color:' + c + '50;background:' + c + '10;">' +
      '<span class="result-big-icon">' + icon + '</span>' +
      '<div style="font-family:var(--font-display);font-size:1.5rem;color:' + c + ';margin-bottom:0.5rem;">' + level + '</div>' +
      '<span class="result-big-score" style="color:' + c + ';">' + pct + '%</span>' +
      '<p style="color:var(--text-muted);max-width:480px;margin:0 auto 1.25rem;">' + title + '</p>' +
      '<div style="margin:0 auto;max-width:360px;">' + scoreBar('Readiness Score', pct, c) + '</div></div>' +
      (meds ? resultCard('💊 Medication Note', '<p style="color:var(--text-muted);font-size:0.9rem;">You are currently taking: <strong>' + sanitizeText(meds) + '</strong>. Your Panchakarma physician MUST be informed of all medications. Some may need to be paused during treatment with your allopathic doctor\'s approval.</p>', 'var(--red-indian)') : '') +
      '<div class="info-box gold" style="margin-bottom:1.25rem;"><p style="color:var(--text-muted);font-size:0.93rem;line-height:1.75;">' + detail + '</p></div>' +
      resultCard('🌿 Recommended Therapies for You', listItems(therapies, c), c) +
      resultCard('📋 Immediate Next Steps', listItems(nextSteps, 'var(--gold)')) +
      '<div class="feat-disclaimer">⚠️ This is a self-assessment tool. Panchakarma must always be administered by a qualified Vaidya (Ayurvedic physician).</div>';
    animateBars(r); fadeIn(r);
    r.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
}

// ════════════════════════════════════════════════════════════════
// FEATURE 12 — DRAVYAGUNA HERB MAP
// ════════════════════════════════════════════════════════════════
function renderHerbMap(container) {
  var regions = [
    { id:'himalaya', name:'Himalayas', icon:'🏔️', states:'Uttarakhand, Himachal Pradesh, J&K — 1500–4500m altitude',
      herbs:[
        { name:'Shilajit',    latin:'Mineral Exudate',           use:'Rasayana (rejuvenation), male vitality, energy, anti-aging',              dosha:'Vata-Kapha',    season:'Collected in summer when rock surface warms', rasa:'Pungent, Bitter',       action:'Adaptogen, Aphrodisiac, Anti-aging' },
        { name:'Brahmi',      latin:'Bacopa monniera',           use:'Memory, concentration, anxiety, epilepsy, Medhya Rasayana',               dosha:'Tridoshic',     season:'Year-round, prefers marshy areas',            rasa:'Bitter, Astringent',    action:'Nervine, Nootropic, Adaptogen' },
        { name:'Kutki',       latin:'Picrorhiza kurroa',         use:'Liver disease, fever, digestive disorders, Pitta imbalance',              dosha:'Pitta-Kapha',   season:'Roots harvested before flowering',            rasa:'Bitter',                action:'Hepatoprotective, Anti-inflammatory' },
        { name:'Jatamansi',   latin:'Nardostachys jatamansi',   use:'Insomnia, anxiety, epilepsy, headache — calmer of Vata',                  dosha:'Vata-Pitta',    season:'Harvested at 3000–5000m altitude',            rasa:'Bitter, Sweet',         action:'Nervine, Sedative, Nootropic' },
        { name:'Atibala',     latin:'Abutilon indicum',          use:'Vata disorders, joint pain, urinary issues, strength building',           dosha:'Vata',          season:'Subtropical Himalayan zones',                 rasa:'Sweet',                 action:'Tonic, Diuretic, Anti-inflammatory' }] },
    { id:'western_ghats', name:'Western Ghats', icon:'🌴', states:'Kerala, Karnataka, Maharashtra — Sahyadri biodiversity hotspot',
      herbs:[
        { name:'Ashwagandha', latin:'Withania somnifera',        use:'Stress adaptogen, male health, muscle strength, immunity',                dosha:'Vata-Kapha',    season:'Roots harvested October–November',            rasa:'Bitter, Astringent',    action:'Adaptogen, Aphrodisiac, Immunomodulator' },
        { name:'Shatavari',   latin:'Asparagus racemosus',       use:'Female reproductive health, galactagogue, immune tonic',                  dosha:'Vata-Pitta',    season:'Roots harvested at 2 years maturity',         rasa:'Sweet, Bitter',         action:'Adaptogen, Galactagogue, Tonic' },
        { name:'Neem',        latin:'Azadirachta indica',        use:'Skin diseases, blood purification, diabetes, anti-parasitic',             dosha:'Pitta-Kapha',   season:'Leaves most potent in spring',                rasa:'Bitter',                action:'Anti-microbial, Blood purifier, Anti-diabetic' },
        { name:'Cardamom',    latin:'Elettaria cardamomum',      use:'Digestive spice, nausea, bad breath, urinary complaints',                 dosha:'Tridoshic',     season:'Harvested in Wayanad, Kerala year-round',     rasa:'Sweet, Pungent',        action:'Digestive, Carminative, Aromatic' },
        { name:'Black Pepper (Maricha)', latin:'Piper nigrum',   use:'Agni kindler, cough, weight management, Ama elimination',                dosha:'Kapha',         season:'Harvested green or red in Kerala forests',    rasa:'Pungent',               action:'Agni-stimulant, Bioavailability enhancer' }] },
    { id:'rajasthan', name:'Rajasthan & Gujarat', icon:'🏜️', states:'Thar Desert, Aravalli Hills, Kutch',
      herbs:[
        { name:'Guggulu',     latin:'Commiphora wightii',        use:'Cholesterol, arthritis, hypothyroidism, Ama elimination, weight',         dosha:'All Doshas',    season:'Resin harvested Nov–March from rocky terrain', rasa:'Bitter, Pungent, Sweet', action:'Anti-inflammatory, Lipid-lowering, Thyroid modulator' },
        { name:'Amalaki (Amla)', latin:'Phyllanthus emblica',    use:'Vitamin C source, Rasayana, digestive, hair, skin — all doshas',          dosha:'Tridoshic',     season:'Fruit harvested Oct–Feb',                     rasa:'5 of 6 Rasas',          action:'Rasayana, Vitamin C, Digestive' },
        { name:'Isabgol',     latin:'Plantago ovata',            use:'Constipation, IBS, cholesterol, bulk laxative',                           dosha:'Vata',          season:'Harvested January–March in Gujarat',           rasa:'Sweet, Astringent',     action:'Bulk laxative, Cholesterol-lowering' },
        { name:'Aloe Vera (Kumari)', latin:'Aloe barbadensis',   use:'Pitta conditions, skin, constipation, liver, female health',              dosha:'Pitta-Vata',    season:'Year-round, thrives in dry heat',              rasa:'Bitter',                action:'Pitta cooler, Laxative, Vulnerary' }] },
    { id:'central', name:'Central India', icon:'🌳', states:'Madhya Pradesh, Chhattisgarh — Vindhya and Satpura forests',
      herbs:[
        { name:'Haritaki',    latin:'Terminalia chebula',        use:'King of herbs — digestive, Rasayana, laxative, Vata master',              dosha:'Tridoshic',     season:'Fruits collected Oct–Nov',                    rasa:'5 of 6 Rasas',          action:'Digestive, Rasayana, Laxative' },
        { name:'Bibhitaki',   latin:'Terminalia bellirica',      use:'Respiratory, Kapha diseases, voice disorders, hair health',               dosha:'Kapha',         season:'Fruits collected September–November',          rasa:'Astringent',            action:'Expectorant, Antioxidant, Kapha-reducer' },
        { name:'Giloy (Guduchi)', latin:'Tinospora cordifolia',  use:'Immunity, fever, detox, diabetes support, powerful adaptogen',            dosha:'Tridoshic',     season:'Stem harvested year-round, most potent rainy season', rasa:'Bitter, Astringent', action:'Immunomodulator, Anti-pyretic, Adaptogen' },
        { name:'Pippali',     latin:'Piper longum',              use:'Long pepper — Agni kindler, respiratory, liver, Ama removal',             dosha:'Kapha-Vata',    season:'Unripe fruits harvested from humid forests',   rasa:'Pungent',               action:'Agni-stimulant, Bioavailability enhancer, Expectorant' }] },
    { id:'kerala', name:'Kerala — Ayurveda Heartland', icon:'🌿', states:"God's Own Country — where Ayurveda is living practice",
      herbs:[
        { name:'Coconut (Narikela)', latin:'Cocos nucifera',     use:'Cooling, nourishing, Pitta pacifier, hair and skin',                     dosha:'Pitta-Vata',    season:'Year-round, coastal Kerala',                  rasa:'Sweet',                 action:'Nourishing, Cooling, Oleation' },
        { name:'Turmeric (Haridra)', latin:'Curcuma longa',      use:'Anti-inflammatory, skin, liver, diabetes, wound healing',                dosha:'Tridoshic',     season:'Rhizome harvested Dec–Jan in Kerala',          rasa:'Bitter, Pungent',       action:'Anti-inflammatory, Hepatoprotective, Antiseptic' },
        { name:'Tulsi (Holy Basil)', latin:'Ocimum sanctum',     use:'Immunity, respiratory, adaptogen, fever, anti-viral',                    dosha:'Vata-Kapha',    season:'Year-round',                                   rasa:'Pungent, Bitter',       action:'Adaptogen, Anti-viral, Immunomodulator' },
        { name:'Ginger (Ardrak/Shunti)', latin:'Zingiber officinale', use:'Agni kindler, nausea, inflammation, cold, joint pain',             dosha:'Vata-Kapha',    season:'Fresh Aug–Oct, dried year-round',              rasa:'Pungent',               action:'Agni-stimulant, Anti-emetic, Anti-inflammatory' }] },
    { id:'northeast', name:'Northeast India', icon:'🎋', states:'Assam, Manipur, Meghalaya — biodiversity hotspot',
      herbs:[
        { name:'Brahmi (Mandukparni)', latin:'Centella asiatica', use:'Wound healing, skin, memory, connective tissue strength',               dosha:'Pitta-Vata',    season:'Year-round in wet, humid northeast',           rasa:'Bitter, Astringent, Sweet', action:'Nervine, Wound healer, Cognitive' },
        { name:'Vasaka (Malabar Nut)', latin:'Adhatoda vasica',   use:'Respiratory diseases, asthma, bronchitis, cough, Kapha',               dosha:'Kapha-Pitta',   season:'Leaves most active before flowering',          rasa:'Bitter, Astringent',    action:'Expectorant, Bronchodilator, Anti-asthmatic' },
        { name:'Kali Musli',  latin:'Curculigo orchioides',       use:'Male vitality, Vata disorders, strength, sexual function',              dosha:'Vata',          season:'Tubers harvested Oct–Nov',                    rasa:'Sweet, Bitter',         action:'Aphrodisiac, Tonic, Adaptogen' },
        { name:'Chirata',     latin:'Swertia chirayita',          use:'Bitter tonic, fever, malaria prevention, liver, blood sugar',           dosha:'Pitta-Kapha',   season:'Whole plant harvested in autumn',              rasa:'Bitter',                action:'Bitter tonic, Anti-malarial, Hepatoprotective' }] }
  ];

  var allHerbs = [];
  regions.forEach(function(r) { r.herbs.forEach(function(h) { allHerbs.push(Object.assign({}, h, { region: r.name, regionIcon: r.icon })); }); });

  var wrap = wrapFeature(container,
    '<div class="test-header"><div class="test-header-icon">🗺️</div><div><h2>Dravyaguna Herb Map</h2><p>India\'s Living Aromatic Pharmacy — Regional Herb Atlas</p></div></div>' +
    '<div style="padding:1rem 0 0;">' +
    '<div style="display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:1.5rem;align-items:center;">' +
    '<input type="text" id="herbSearch" placeholder="Search herb by name, use, or dosha..." class="feat-input" style="flex:1;min-width:200px;" oninput="window._herbFilter()">' +
    '<div style="display:flex;gap:0.5rem;flex-wrap:wrap;">' +
    ['All','Vata','Pitta','Kapha'].map(function(d, i) {
      return '<button onclick="window._doshaFilter(\'' + d + '\')" id="dFilter_' + d + '" style="padding:0.5rem 1rem;border-radius:50px;border:1.5px solid ' + (i === 0 ? 'var(--gold)' : 'rgba(212,160,23,0.2)') + ';background:' + (i === 0 ? 'rgba(212,160,23,0.12)' : 'transparent') + ';font-family:var(--font-body);font-size:0.85rem;font-weight:700;cursor:pointer;transition:all 0.2s;">' + d + '</button>';
    }).join('') + '</div></div>' +
    '<div class="herb-map-grid">' +
    regions.map(function(r) {
      return '<button class="herb-region-btn" id="reg_' + r.id + '" onclick="window._region(\'' + r.id + '\')">' +
        '<div style="font-size:2.5rem;margin-bottom:0.4rem;">' + r.icon + '</div>' +
        '<div style="font-family:var(--font-display);font-size:0.82rem;color:var(--brown-dark);line-height:1.35;">' + r.name + '</div>' +
        '<div style="font-size:0.72rem;color:var(--text-muted);margin-top:0.2rem;">' + r.herbs.length + ' herbs</div></button>';
    }).join('') + '</div>' +
    '<div id="regionR" style="margin-top:1rem;"></div>' +
    '<div id="searchR" style="display:none;margin-top:1rem;"></div></div>'
  );

  var currentDosha = 'All';

  window._doshaFilter = function(d) {
    currentDosha = d;
    ['All','Vata','Pitta','Kapha'].forEach(function(x) {
      var b = document.getElementById('dFilter_' + x);
      if (b) { b.style.borderColor = x === d ? 'var(--gold)' : 'rgba(212,160,23,0.2)'; b.style.background = x === d ? 'rgba(212,160,23,0.12)' : 'transparent'; }
    });
    window._herbFilter();
  };

  window._herbFilter = function() {
    var si = document.getElementById('herbSearch');
    var query = (si ? si.value.trim().toLowerCase() : '');
    if (!query && currentDosha === 'All') {
      document.getElementById('searchR').style.display = 'none';
      return;
    }
    var filtered = allHerbs.filter(function(h) {
      var ms = !query || h.name.toLowerCase().includes(query) || h.latin.toLowerCase().includes(query) || h.use.toLowerCase().includes(query) || h.dosha.toLowerCase().includes(query);
      var md = currentDosha === 'All' || h.dosha.toLowerCase().includes(currentDosha.toLowerCase());
      return ms && md;
    });
    var sr = document.getElementById('searchR');
    sr.style.display = '';
    wrap.querySelector('#regionR').innerHTML = '';
    if (filtered.length === 0) { sr.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--text-muted);">No herbs found. Try a different search or filter.</div>'; return; }
    sr.innerHTML = '<div style="font-size:0.82rem;color:var(--text-muted);margin-bottom:1rem;">' + filtered.length + ' herb' + (filtered.length > 1 ? 's' : '') + ' found</div><div>' + filtered.map(herbCard).join('') + '</div>';
    fadeIn(sr);
  };

  function herbCard(h) {
    return '<div class="herb-card">' +
      '<div class="herb-card-head"><div>' +
      '<div class="herb-name">🌿 ' + h.name + '</div>' +
      '<div class="herb-latin">' + h.latin + '</div>' +
      (h.region ? '<div class="herb-region-tag">' + h.regionIcon + ' ' + h.region + '</div>' : '') + '</div>' +
      '<div>' + pillBadge(h.dosha, 'var(--saffron)') + '</div></div>' +
      '<div class="herb-details"><strong style="color:var(--brown-dark);">Uses:</strong> ' + h.use + '</div>' +
      '<div class="herb-meta"><span>🌿 <strong>Rasa:</strong> ' + h.rasa + '</span><span>⚡ <strong>Action:</strong> ' + h.action + '</span><span>🗓 <strong>Harvest:</strong> ' + h.season + '</span></div></div>';
  }

  window._region = function(id) {
    var region = regions.find(function(r) { return r.id === id; });
    document.querySelectorAll('.herb-region-btn').forEach(function(b) { b.classList.remove('active'); });
    document.getElementById('reg_' + id).classList.add('active');
    document.getElementById('searchR').style.display = 'none';
    var r = wrap.querySelector('#regionR');
    r.innerHTML =
      '<div style="background:linear-gradient(135deg,rgba(212,160,23,0.1),rgba(232,118,10,0.04));border:2px solid rgba(212,160,23,0.3);border-radius:var(--radius-xl);padding:1.75rem 2rem;margin-bottom:1.5rem;">' +
      '<div style="display:flex;align-items:center;gap:1rem;margin-bottom:0.5rem;">' +
      '<span style="font-size:3rem;">' + region.icon + '</span>' +
      '<div><div style="font-family:var(--font-display);font-size:1.3rem;color:var(--brown-dark);">' + region.name + '</div>' +
      '<div style="font-size:0.85rem;color:var(--text-muted);margin-top:0.2rem;">📍 ' + region.states + '</div></div></div></div>' +
      '<div>' + region.herbs.map(herbCard).join('') + '</div>';
    fadeIn(r); r.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
}
