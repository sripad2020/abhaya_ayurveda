/* ============================================================
   AyuSutra — assess.js
   8 Health Assessment Tests — Full Logic & Rendering
   ============================================================ */

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Hub card click
  document.querySelectorAll('.hub-card').forEach(card => {
    card.addEventListener('click', () => loadTest(card.dataset.test));
  });
  document.querySelectorAll('.hub-card-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      loadTest(btn.closest('.hub-card').dataset.test);
    });
  });
  document.getElementById('backBtn')?.addEventListener('click', showHub);
});

function showHub() {
  document.getElementById('hubSection').style.display = 'block';
  document.getElementById('testPanel').style.display = 'none';
  window.scrollTo({ top: document.getElementById('hubSection').offsetTop - 80, behavior: 'smooth' });
}

function loadTest(name) {
  document.getElementById('hubSection').style.display = 'none';
  document.getElementById('testPanel').style.display = 'block';
  const container = document.getElementById('testContainer');
  container.innerHTML = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });

  switch(name) {
    case 'obesity':      renderObesityTest(container); break;
    case 'diabetes':     renderDiabetesTest(container); break;
    case 'thyroid':      renderThyroidTest(container); break;
    case 'womens':       renderWomensTest(container); break;
    case 'skin':         renderSkinTest(container); break;
    case 'prakruti':     renderPrakrutiTest(container); break;
    case 'hairfall':     renderHairfallTest(container); break;
    case 'eyetest':      renderEyeTest(container); break;
    // ── NEW CLINICAL ASSESSMENTS ──
    case 'mental':       renderMentalHealthTest(container); break;
    case 'gut':          renderGutHealthTest(container); break;
    case 'joint':        renderJointHealthTest(container); break;
    case 'sleep':        renderSleepQualityTest(container); break;
    case 'energy':       renderEnergyFatigueTest(container); break;
    // ── 12 AYURVEDIC TOOLS ──
    case 'nadi':         renderNadiPariksha(container); break;
    case 'jivha':        renderJivhaPariksha(container); break;
    case 'ama':          renderAmaTest(container); break;
    case 'dinacharya':   renderDinacharya(container); break;
    case 'ritucharya':   renderRitucharya(container); break;
    case 'agni':         renderAgniTracker(container); break;
    case 'rasa':         renderRasaPlanner(container); break;
    case 'pranayama':    renderPranayama(container); break;
    case 'panchakarma':  renderPanchakarma(container); break;
    case 'herbchecker':  renderHerbChecker(container); break;
    case 'nakshatra':    renderNakshatra(container); break;
    case 'herbmap':      renderHerbMap(container); break;
  }
}

// ── SHARED TEST BUILDER ───────────────────────────────────────
function buildQuizTest({ icon, title, subtitle, questions, scoreTest, onComplete }) {
  const answers = new Array(questions.length).fill(null);
  let current = 0;

  const el = document.createElement('div');
  el.className = 'test-card';
  el.innerHTML = `
    <div class="test-header">
      <div class="test-header-icon">${icon}</div>
      <div>
        <h2>${title}</h2>
        <p>${subtitle}</p>
      </div>
    </div>
    <div class="test-progress-bar"><div class="test-progress-fill" id="tpFill" style="width:0%"></div></div>
    <div class="test-body" id="testBody"></div>
  `;

  function render() {
    const body = el.querySelector('#testBody');
    const pct = Math.round((current / questions.length) * 100);
    el.querySelector('#tpFill').style.width = pct + '%';

    const q = questions[current];
    body.innerHTML = `
      <div class="test-step active">
        <p class="test-question">${current + 1}. ${q.text}</p>
        ${q.sub ? `<p class="test-question-sub">${q.sub}</p>` : ''}
        <div class="test-options">
          ${q.options.map((opt, i) => `
            <button class="test-option ${answers[current] === i ? 'selected' : ''}" data-idx="${i}">
              <div class="test-option-dot"></div>
              <span>${opt.label}</span>
            </button>
          `).join('')}
        </div>
        <div class="test-nav">
          <span class="test-step-counter">Question ${current + 1} of ${questions.length}</span>
          <div style="display:flex;gap:0.75rem">
            ${current > 0 ? `<button class="btn-test-prev" id="prevBtn">← Back</button>` : '<span></span>'}
            <button class="btn-test-next" id="nextBtn" ${answers[current] === null ? 'disabled' : ''}>${current === questions.length - 1 ? 'See Results ✦' : 'Next →'}</button>
          </div>
        </div>
      </div>
    `;

    body.querySelectorAll('.test-option').forEach(btn => {
      btn.addEventListener('click', () => {
        answers[current] = parseInt(btn.dataset.idx);
        body.querySelectorAll('.test-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        el.querySelector('#nextBtn').disabled = false;
      });
    });

    const nextBtn = body.querySelector('#nextBtn');
    const prevBtn = body.querySelector('#prevBtn');

    nextBtn?.addEventListener('click', () => {
      if (current < questions.length - 1) { current++; render(); }
      else { onComplete(answers, scoreTest(answers)); }
    });
    prevBtn?.addEventListener('click', () => { if (current > 0) { current--; render(); } });
  }

  render();
  return el;
}

// ── SHARED RESULT RENDERER ─────────────────────────────────────
function renderResult(container, { icon, title, score, maxScore, category, riskLevel, breakdown, ayurvedic, suggestions }) {
  const pct = Math.round((score / maxScore) * 100);
  const riskClass = riskLevel === 'low' ? 'risk-low' : riskLevel === 'moderate' ? 'risk-moderate' : 'risk-high';

  const el = document.createElement('div');
  el.className = 'test-card';
  el.innerHTML = `
    <div class="test-header">
      <div class="test-header-icon">${icon}</div>
      <div>
        <h2>${title} — Results</h2>
        <p>Your personalised assessment is ready</p>
      </div>
    </div>
    <div class="test-results">
      <div class="results-hero-band">
        <div class="result-big-score">${score}<span style="font-size:2rem">/${maxScore}</span></div>
        <div class="result-category">${category}</div>
        <div class="result-sub"><span class="risk-tag ${riskClass}">${riskLevel.toUpperCase()} RISK</span></div>
        <div class="result-meter" style="margin-top:1.5rem">
          <div class="result-meter-track">
            <div class="result-meter-needle" id="rmNeedle" style="left:${pct}%"></div>
          </div>
          <div class="result-meter-labels"><span>Low</span><span>Moderate</span><span>High</span></div>
        </div>
      </div>

      <div class="result-breakdown">
        ${breakdown.map(b => `
          <div class="breakdown-card">
            <div class="bd-icon">${b.icon}</div>
            <div class="bd-label">${b.label}</div>
            <div class="bd-value">${b.value}</div>
            <div class="bd-sub">${b.sub}</div>
          </div>
        `).join('')}
      </div>

      <div class="ayur-result-card">
        <h3>ॐ Ayurvedic Perspective</h3>
        <p>${ayurvedic}</p>
      </div>

      <div class="result-suggestions">
        <h3>Personalised Recommendations</h3>
        <div class="sug-list">
          ${suggestions.map(s => `
            <div class="sug-item">
              <div class="sug-item-icon">${s.icon}</div>
              <div class="sug-item-body">
                <strong>${s.title}</strong>
                <p>${s.text}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="result-cta">
        <h3>🙏 Speak with an Ayurvedic Physician</h3>
        <p>Get a personalised treatment plan — herbal formulations, diet protocol, and Panchakarma therapy tailored to your results.</p>
        <div class="result-cta-btns">
          <a href="/consult" class="btn btn-primary">Book Free Consultation ✦</a>
          <button class="btn btn-ghost" onclick="showHub()">← Back to Hub</button>
        </div>
      </div>
    </div>
  `;
  container.innerHTML = '';
  container.appendChild(el);
  setTimeout(() => { el.querySelector('#rmNeedle').style.left = pct + '%'; }, 200);
}

// ══════════════════════════════════════════════════════════════
// 1. OBESITY TEST
// ══════════════════════════════════════════════════════════════
function renderObesityTest(container) {
  const questions = [
    { text: 'What is your current BMI range?', sub: 'BMI = weight(kg) ÷ height(m)²', options: [
      { label: 'Below 18.5 (Underweight)', score: 0 },
      { label: '18.5–24.9 (Normal)', score: 0 },
      { label: '25–29.9 (Overweight)', score: 2 },
      { label: '30–34.9 (Obese I)', score: 4 },
      { label: '35+ (Obese II/III)', score: 6 },
    ]},
    { text: 'Where do you carry most of your weight?', options: [
      { label: 'Fairly even distribution', score: 0 },
      { label: 'Mostly hips and thighs (pear shape)', score: 1 },
      { label: 'Mostly belly/abdomen (apple shape)', score: 3 },
      { label: 'Significant belly — clothes feel tight', score: 5 },
    ]},
    { text: 'How would you describe your activity level?', options: [
      { label: 'Very active — exercise 5+ days/week', score: 0 },
      { label: 'Moderately active — 3–4 days/week', score: 1 },
      { label: 'Lightly active — 1–2 days/week', score: 2 },
      { label: 'Sedentary — desk job, minimal movement', score: 4 },
    ]},
    { text: 'How often do you eat due to stress, boredom or emotions rather than hunger?', options: [
      { label: 'Rarely or never', score: 0 },
      { label: 'Occasionally (once a week)', score: 1 },
      { label: 'Often (several times a week)', score: 2 },
      { label: 'Almost daily', score: 3 },
    ]},
    { text: 'Do you have any of these metabolic symptoms?', sub: 'Select the one that best applies', options: [
      { label: 'None of the below', score: 0 },
      { label: 'High blood pressure or borderline', score: 2 },
      { label: 'High blood sugar or pre-diabetes', score: 3 },
      { label: 'High cholesterol / triglycerides', score: 2 },
      { label: 'Multiple of the above', score: 5 },
    ]},
    { text: 'How many hours of sleep do you get per night?', options: [
      { label: '7–9 hours (optimal)', score: 0 },
      { label: '6–7 hours', score: 1 },
      { label: '5–6 hours', score: 2 },
      { label: 'Less than 5 hours', score: 3 },
    ]},
    { text: 'Family history of obesity or metabolic disease?', options: [
      { label: 'No family history', score: 0 },
      { label: 'One parent affected', score: 1 },
      { label: 'Both parents or siblings affected', score: 2 },
    ]},
  ];

  function scoreTest(answers) {
    let total = 0;
    answers.forEach((a, i) => { if (a !== null) total += questions[i].options[a].score; });
    return total;
  }

  function onComplete(answers, score) {
    const maxScore = 26;
    let category, risk;
    if (score <= 4) { category = 'Low Obesity Risk'; risk = 'low'; }
    else if (score <= 10) { category = 'Moderate Risk — Monitor'; risk = 'moderate'; }
    else if (score <= 18) { category = 'High Risk — Action Needed'; risk = 'high'; }
    else { category = 'Very High Risk — Medical Attention'; risk = 'high'; }

    const waistRisk = answers[1] >= 2;
    const metabolic = answers[4] >= 1;

    renderResult(container, {
      icon: '🏋️', title: 'Obesity & Weight',
      score, maxScore, category, riskLevel: risk,
      breakdown: [
        { icon: '⚖️', label: 'BMI Category', value: ['Underweight','Normal','Overweight','Obese I','Obese II+'][answers[0] ?? 1], sub: 'Weight classification' },
        { icon: '🎯', label: 'Fat Distribution', value: answers[1] >= 2 ? 'Central' : 'Peripheral', sub: answers[1] >= 2 ? 'Apple — higher risk' : 'Pear — lower risk' },
        { icon: '⚡', label: 'Metabolic Risk', value: metabolic ? 'Detected' : 'Clear', sub: metabolic ? 'Risk factors present' : 'No factors flagged' },
      ],
      ayurvedic: score <= 4
        ? 'Your weight appears balanced — a sign of Sama Kapha. Maintain through Dinacharya (daily routine), seasonal cleansing (Ritucharya), and mindful Mitahara (moderate eating).'
        : score <= 10
        ? 'Early Kapha accumulation detected. Ayurveda recommends Langhan (therapeutic reduction), warm spiced foods (ginger, pepper, turmeric), and vigorous daily Vyayama (exercise).'
        : 'Significant Kapha–Meda (fat tissue) imbalance. Panchakarma — specifically Udwarthana (dry powder massage), Virechana (purgation), and Triphala-based rasayanas — are indicated under physician guidance.',
      suggestions: [
        { icon: '🍽️', title: 'Kapha-Pacifying Diet', text: 'Favour light, warm, dry foods. Prioritise vegetables, legumes, and bitter herbs. Avoid dairy, sweets, and cold foods. Eat your largest meal at noon when Agni (digestive fire) is strongest.' },
        { icon: '🏃', title: 'Daily Movement', text: 'Minimum 45 minutes of brisk walking or Surya Namaskar (12 rounds) daily. Exercise at half capacity — until you break a sweat at the forehead. Avoid over-exertion.' },
        waistRisk ? { icon: '⚠️', title: 'Visceral Fat Alert', text: 'Central fat accumulation strongly increases heart disease and diabetes risk. Interval training (HIIT), 16:8 intermittent fasting, and Guggulu supplementation specifically target visceral fat.' }
                  : { icon: '😴', title: 'Sleep & Cortisol', text: 'Poor sleep raises cortisol which directly drives abdominal fat storage. Target 7–9 hours. Ashwagandha at bedtime reduces cortisol by up to 28% in clinical studies.' },
        { icon: '🌿', title: 'Ayurvedic Herbs', text: 'Triphala (balances all doshas + supports digestion), Guggulu (fat metabolism), Vijayasar (metabolic regulator), and Medohar Guggulu (specific for obesity) — under physician supervision.' },
      ],
    });
  }

  container.appendChild(buildQuizTest({ icon: '🏋️', title: 'Obesity & Weight Assessment', subtitle: '7 questions · 3 minutes · Visceral fat, metabolic risk, lifestyle analysis', questions, scoreTest, onComplete }));
}

// ══════════════════════════════════════════════════════════════
// 2. DIABETES RISK TEST (IDRS-based)
// ══════════════════════════════════════════════════════════════
function renderDiabetesTest(container) {
  const questions = [
    { text: 'What is your age?', sub: 'Age is a primary IDRS risk factor', options: [
      { label: 'Under 35', score: 0 },
      { label: '35–49', score: 20 },
      { label: '50 or above', score: 30 },
    ]},
    { text: 'What is your waist circumference?', sub: 'Measure at the navel level', options: [
      { label: 'Men < 80cm / Women < 75cm', score: 0 },
      { label: 'Men 80–89cm / Women 75–84cm', score: 10 },
      { label: 'Men 90–99cm / Women 85–94cm', score: 20 },
      { label: 'Men ≥ 100cm / Women ≥ 95cm', score: 30 },
    ]},
    { text: 'How physically active are you?', options: [
      { label: 'Vigorous activity at work (manual labour, farming)', score: 0 },
      { label: 'Moderate activity or regular exercise', score: 0 },
      { label: 'Sedentary work + some leisure activity', score: 20 },
      { label: 'No physical activity or exercise at all', score: 30 },
    ]},
    { text: 'Do you have a family history of diabetes?', options: [
      { label: 'No family history', score: 0 },
      { label: 'One parent with diabetes', score: 10 },
      { label: 'Both parents or sibling with diabetes', score: 20 },
    ]},
    { text: 'Have you noticed increased thirst or frequent urination?', options: [
      { label: 'No, not noticed', score: 0 },
      { label: 'Occasionally', score: 5 },
      { label: 'Yes, frequently', score: 10 },
      { label: 'Yes, along with fatigue and blurred vision', score: 20 },
    ]},
    { text: 'Do wounds or cuts heal slower than expected?', options: [
      { label: 'No, heal normally', score: 0 },
      { label: 'Slightly slower than before', score: 5 },
      { label: 'Noticeably slow healing', score: 10 },
    ]},
    { text: 'Do you experience unexplained fatigue after meals?', options: [
      { label: 'Rarely or never', score: 0 },
      { label: 'Occasionally', score: 5 },
      { label: 'Often, especially after high-carb meals', score: 10 },
    ]},
  ];

  function scoreTest(answers) {
    let total = 0;
    answers.forEach((a, i) => { if (a !== null) total += questions[i].options[a].score; });
    return total;
  }

  function onComplete(answers, score) {
    const maxScore = 130;
    let category, risk;
    if (score < 30) { category = 'Low Diabetes Risk'; risk = 'low'; }
    else if (score < 60) { category = 'Moderate Risk — Monitor Closely'; risk = 'moderate'; }
    else if (score < 90) { category = 'High Risk — Blood Test Advised'; risk = 'high'; }
    else { category = 'Very High Risk — See Doctor Now'; risk = 'high'; }

    renderResult(container, {
      icon: '🩸', title: 'Diabetes Risk (IDRS)',
      score, maxScore, category, riskLevel: risk,
      breakdown: [
        { icon: '📊', label: 'IDRS Score', value: score, sub: 'Indian Diabetes Risk Score' },
        { icon: '🎯', label: 'Primary Factor', value: answers[2] >= 2 ? 'Inactivity' : answers[1] >= 2 ? 'Waist Size' : 'Age', sub: 'Top contributor' },
        { icon: '🧬', label: 'Genetic Risk', value: answers[3] === 0 ? 'None' : answers[3] === 1 ? 'Moderate' : 'High', sub: 'Family history' },
      ],
      ayurvedic: score < 30
        ? 'Your Madhumeha (diabetes) risk is low. In Ayurveda, this reflects balanced Kapha and healthy Ojas (vital essence). Maintain with bitter vegetables, regular exercise, and avoiding excessive sweets.'
        : score < 60
        ? 'Borderline Madhumeha indicators detected. Ayurveda identifies this as early Kapha-Vata imbalance in the urinary channels (Meda Vaha Srotas). Bitter gourd (Karela), Vijayasar wood, and Gurmar are classical prescriptions.'
        : 'High Madhumeha risk. Immediate lifestyle intervention is essential. Ayurvedic treatment includes Panchakarma (Virechana), Nishaamalaki (Amalaki + Turmeric), and Chandraprabha Vati — alongside dietary and activity modifications.',
      suggestions: [
        { icon: '🥗', title: 'Anti-Diabetic Diet', text: 'Reduce refined carbohydrates, white rice, and sugar. Favour low-glycemic foods: barley, ragi, vegetables, legumes. Karela (bitter gourd), methi seeds, and jamun are evidence-based blood sugar regulators.' },
        { icon: '🏃', title: 'Post-Meal Walk', text: '15–20 minute walk after each meal significantly reduces post-prandial blood glucose. This is one of the most clinically effective and underutilised interventions.' },
        { icon: '🌿', title: 'Key Herbs', text: 'Gurmar (Gymnema sylvestre — "sugar destroyer"), Vijayasar bark, Neem, and Turmeric have clinical evidence for blood sugar modulation. Start under physician supervision.' },
        { icon: '🧪', title: 'Get Tested', text: score >= 60 ? 'Your score is high. Please get HbA1c, fasting glucose, and post-prandial glucose tested immediately. Early detection makes diabetes entirely manageable.' : 'Consider annual HbA1c screening. Catching pre-diabetes early allows complete reversal through lifestyle changes alone.' },
      ],
    });
  }

  container.appendChild(buildQuizTest({ icon: '🩸', title: 'Diabetes Risk Screening (IDRS)', subtitle: '7 questions · Indian Diabetes Risk Score · Clinically validated', questions, scoreTest, onComplete }));
}

// ══════════════════════════════════════════════════════════════
// 3. THYROID TEST
// ══════════════════════════════════════════════════════════════
function renderThyroidTest(container) {
  const questions = [
    { text: 'How would you describe your energy levels?', options: [
      { label: 'Good — energetic most of the day', score: { hypo: 0, hyper: 0 } },
      { label: 'Sluggish — always tired, hard to get out of bed', score: { hypo: 3, hyper: 0 } },
      { label: 'Wired but exhausted — anxious yet fatigued', score: { hypo: 0, hyper: 3 } },
      { label: 'Racing heart, excessive energy, can\'t rest', score: { hypo: 0, hyper: 4 } },
    ]},
    { text: 'How has your weight changed recently without diet changes?', options: [
      { label: 'Stable — no significant change', score: { hypo: 0, hyper: 0 } },
      { label: 'Unexplained weight gain despite eating less', score: { hypo: 4, hyper: 0 } },
      { label: 'Unexplained weight loss despite eating more', score: { hypo: 0, hyper: 4 } },
      { label: 'Both fluctuating up and down', score: { hypo: 1, hyper: 1 } },
    ]},
    { text: 'How do you feel about temperature?', options: [
      { label: 'Comfortable in most temperatures', score: { hypo: 0, hyper: 0 } },
      { label: 'Always cold — cold hands, feet, intolerant to cold', score: { hypo: 3, hyper: 0 } },
      { label: 'Always hot — excessive sweating, heat intolerant', score: { hypo: 0, hyper: 3 } },
    ]},
    { text: 'How is your bowel function?', options: [
      { label: 'Regular — once daily', score: { hypo: 0, hyper: 0 } },
      { label: 'Constipated — irregular, hard stools', score: { hypo: 3, hyper: 0 } },
      { label: 'Loose stools or frequent movements', score: { hypo: 0, hyper: 3 } },
    ]},
    { text: 'How is your mood and mental state?', options: [
      { label: 'Balanced — no significant issues', score: { hypo: 0, hyper: 0 } },
      { label: 'Depressed, brain fog, slow thinking', score: { hypo: 3, hyper: 0 } },
      { label: 'Anxious, irritable, mood swings, difficulty concentrating', score: { hypo: 0, hyper: 3 } },
      { label: 'Panic attacks or severe anxiety', score: { hypo: 0, hyper: 4 } },
    ]},
    { text: 'Any changes in hair or skin?', options: [
      { label: 'No significant changes', score: { hypo: 0, hyper: 0 } },
      { label: 'Dry skin, coarse hair, hair falling out', score: { hypo: 3, hyper: 0 } },
      { label: 'Fine/thinning hair, moist soft skin', score: { hypo: 0, hyper: 2 } },
    ]},
    { text: 'Have you noticed a swelling in your neck region?', options: [
      { label: 'No visible swelling', score: { hypo: 0, hyper: 0 } },
      { label: 'Mild swelling or fullness', score: { hypo: 2, hyper: 2 } },
      { label: 'Visible goitre or enlargement', score: { hypo: 3, hyper: 3 } },
    ]},
  ];

  function scoreTest(answers) {
    let hypo = 0, hyper = 0;
    answers.forEach((a, i) => {
      if (a !== null) {
        hypo  += questions[i].options[a].score.hypo;
        hyper += questions[i].options[a].score.hyper;
      }
    });
    return { hypo, hyper, total: hypo + hyper };
  }

  function onComplete(answers, scoreObj) {
    const { hypo, hyper, total } = scoreObj;
    const maxScore = 26;
    const dominant = hypo > hyper ? 'Hypothyroid' : hyper > hypo ? 'Hyperthyroid' : 'Balanced';
    const risk = total <= 4 ? 'low' : total <= 10 ? 'moderate' : 'high';
    const category = total <= 4 ? 'Low Thyroid Risk' : `${dominant} Pattern Detected`;

    renderResult(container, {
      icon: '🦋', title: 'Thyroid Health',
      score: total, maxScore, category, riskLevel: risk,
      breakdown: [
        { icon: '🐢', label: 'Hypothyroid Score', value: hypo, sub: 'Low thyroid indicators' },
        { icon: '🐇', label: 'Hyperthyroid Score', value: hyper, sub: 'Overactive indicators' },
        { icon: '🦋', label: 'Pattern', value: dominant, sub: 'Dominant presentation' },
      ],
      ayurvedic: hypo > hyper
        ? 'Hypothyroid symptoms align with Kapha dominance in Ayurveda — slow metabolism, coldness, weight gain, and depression are classic Kapha excess signs. Treatment involves Kanchanara Guggulu (specific for thyroid), Trikatu (metabolic activator), and Shilajit to kindle Agni.'
        : hyper > hypo
        ? 'Hyperthyroid symptoms reflect Pitta-Vata imbalance — excess heat, anxiety, rapid heart rate, and weight loss are Pitta-Vata aggravation. Cooling herbs like Brahmi, Ashwagandha, and Shatavari calm the nervous system. Avoid pungent, salty, and sour foods.'
        : 'Your thyroid symptoms appear balanced. Maintain thyroid health with adequate iodine (seaweed, dairy, iodised salt), selenium-rich foods (Brazil nuts, sunflower seeds), and regular stress management.',
      suggestions: [
        { icon: '🥦', title: 'Thyroid-Supportive Diet', text: hypo > hyper ? 'Iodine-rich foods (seaweed, dairy), selenium (Brazil nuts), zinc (pumpkin seeds). Avoid raw goitrogenic foods (cabbage, broccoli, soy) when hypothyroid.' : 'Cooling, anti-inflammatory diet. Coconut oil, ghee, cooked vegetables. Avoid caffeine, alcohol, and stimulants which worsen hyperthyroid symptoms.' },
        { icon: '🌿', title: 'Ayurvedic Protocol', text: hypo > hyper ? 'Kanchanara Guggulu — classical thyroid formula. Ashwagandha (thyroid stimulating), Shilajit (metabolic activator). Nasya therapy with Anu Taila supports hypothyroidism.' : 'Brahmi + Shankhapushpi (nervine tonics), Shatavari (cooling), Jatamansi (anxiolytic). Shirodhara (oil flow therapy) directly calms hyperactive thyroid response.' },
        { icon: '🧪', title: 'Essential Tests', text: 'Get TSH, Free T3, Free T4, Anti-TPO antibodies tested. TSH >4.5 mIU/L suggests hypothyroid; TSH <0.4 mIU/L suggests hyperthyroid. Always combine with clinical symptoms.' },
        { icon: '🧘', title: 'Yoga for Thyroid', text: 'Sarvangasana (shoulder stand), Halasana (plough pose), and Ujjayi Pranayama directly stimulate the thyroid gland. Practice daily for 15 minutes for measurable benefit.' },
      ],
    });
  }

  container.appendChild(buildQuizTest({ icon: '🦋', title: 'Thyroid Health Screener', subtitle: '7 questions · Hypo vs Hyperthyroid pattern analysis · Ayurvedic mapping', questions, scoreTest, onComplete }));
}

// ══════════════════════════════════════════════════════════════
// 4. WOMEN'S HEALTH (PCOS) TEST
// ══════════════════════════════════════════════════════════════
function renderWomensTest(container) {
  const questions = [
    { text: 'How would you describe your menstrual cycle?', options: [
      { label: 'Regular — 26–32 days, predictable', score: 0 },
      { label: 'Slightly irregular (varies by 5–7 days)', score: 2 },
      { label: 'Often irregular or delayed (>35 days)', score: 4 },
      { label: 'Very irregular, infrequent, or absent', score: 6 },
    ]},
    { text: 'Have you noticed unusual hair growth on face, chin, or chest?', sub: 'This is called hirsutism — a key PCOS indicator', options: [
      { label: 'No unusual hair growth', score: 0 },
      { label: 'Mild — some fine dark hair on face/chin', score: 2 },
      { label: 'Moderate — noticeable, needs regular removal', score: 4 },
      { label: 'Significant facial/body hair growth', score: 6 },
    ]},
    { text: 'Do you experience acne or oily skin?', options: [
      { label: 'Clear skin, no significant acne', score: 0 },
      { label: 'Mild occasional breakouts', score: 1 },
      { label: 'Regular acne, especially along jawline', score: 3 },
      { label: 'Severe or cystic acne', score: 4 },
    ]},
    { text: 'Have you experienced unexplained weight gain around the abdomen?', options: [
      { label: 'No — weight is stable', score: 0 },
      { label: 'Some gradual weight gain', score: 2 },
      { label: 'Noticeable belly weight gain, hard to lose', score: 4 },
    ]},
    { text: 'How is your hair on the scalp?', options: [
      { label: 'Full and healthy', score: 0 },
      { label: 'Some thinning at temples or crown', score: 2 },
      { label: 'Significant scalp hair thinning', score: 4 },
    ]},
    { text: 'Do you experience mood changes, anxiety, or depression linked to your cycle?', options: [
      { label: 'Rarely — mood is generally stable', score: 0 },
      { label: 'Mild PMS symptoms', score: 1 },
      { label: 'Significant mood swings, anxiety, or depression', score: 3 },
    ]},
    { text: 'Any family history of PCOS, diabetes, or hormonal disorders?', options: [
      { label: 'No family history', score: 0 },
      { label: 'Possible — not confirmed', score: 1 },
      { label: 'Yes — confirmed family history', score: 3 },
    ]},
  ];

  function scoreTest(answers) {
    let total = 0;
    answers.forEach((a, i) => { if (a !== null) total += questions[i].options[a].score; });
    return total;
  }

  function onComplete(answers, score) {
    const maxScore = 30;
    let category, risk;
    if (score <= 4) { category = 'Low PCOS Risk'; risk = 'low'; }
    else if (score <= 12) { category = 'Moderate — Hormonal Imbalance Likely'; risk = 'moderate'; }
    else { category = 'High PCOS Risk — Gynaecological Review Advised'; risk = 'high'; }

    renderResult(container, {
      icon: '👩', title: "Women's Health & PCOS",
      score, maxScore, category, riskLevel: risk,
      breakdown: [
        { icon: '🔄', label: 'Cycle Health', value: ['Regular','Mild','Irregular','Very Irregular'][answers[0] ?? 0], sub: 'Menstrual pattern' },
        { icon: '⚖️', label: 'Androgen Signs', value: (answers[1] ?? 0) + (answers[2] ?? 0) > 3 ? 'Elevated' : 'Normal', sub: 'Hirsutism + acne' },
        { icon: '🧬', label: 'Metabolic Risk', value: (answers[3] ?? 0) >= 2 ? 'Present' : 'Low', sub: 'Weight + insulin' },
      ],
      ayurvedic: score <= 4
        ? 'Healthy menstrual rhythm reflects balanced Apana Vata and Rakta Dhatu (blood tissue). Maintain with Shatavari (female tonic), Ashoka for uterine health, and avoiding cold, raw foods during menstruation.'
        : score <= 12
        ? 'Hormonal imbalance aligns with Kapha-Vata imbalance in Artava Vaha Srotas (reproductive channels). Shatavari + Ashwagandha, Kanchanara Guggulu, and Lodhra are classical PCOS treatments. Avoid dairy excess, sugar, and refined carbs.'
        : 'Significant Kapha-Pitta imbalance in reproductive tissue. Classical Ayurveda describes PCOS as Pushpaghni Jataharini. Panchakarma (Virechana + Uttar Basti), Varanadi Kashayam, and lifestyle overhaul under physician care are the recommended path.',
      suggestions: [
        { icon: '🥗', title: 'Anti-PCOS Diet', text: 'Low-glycemic diet is the most evidence-based PCOS intervention. Eliminate sugar, white flour, and processed foods. Favour millets, vegetables, and legumes. Cinnamon, methi, and Karela regulate insulin — a root driver of PCOS.' },
        { icon: '🏃', title: 'Exercise Protocol', text: 'Regular exercise — particularly strength training 3x/week — lowers androgen levels and improves insulin sensitivity. Yoga, especially Baddha Konasana and Supta Virasana, specifically supports reproductive health.' },
        { icon: '🌿', title: 'Ayurvedic Herbs', text: 'Shatavari (uterine tonic), Ashwagandha (adrenal + hormone balance), Kanchanara Guggulu (anti-androgenic), Lodhra bark (LH/FSH balancer), and Triphala (gut-hormone axis). Under physician supervision.' },
        { icon: '🧪', title: 'Tests to Request', text: 'Ask for: LH/FSH ratio, testosterone, DHEAS, AMH, fasting insulin, and pelvic ultrasound (follicle count). Diagnosis requires at least 2 of 3 Rotterdam criteria: irregular periods, elevated androgens, polycystic ovaries.' },
      ],
    });
  }

  container.appendChild(buildQuizTest({ icon: '👩', title: "Women's Health & PCOS Screener", subtitle: '7 questions · Hormonal imbalance, PCOS risk, fertility index', questions, scoreTest, onComplete }));
}

// ══════════════════════════════════════════════════════════════
// 5. SKIN DISORDERS TEST
// ══════════════════════════════════════════════════════════════
function renderSkinTest(container) {
  const questions = [
    { text: 'What is your predominant skin type?', options: [
      { label: 'Dry — rough, flaky, tight, prone to cracking', score: { vata: 3, pitta: 0, kapha: 0 } },
      { label: 'Oily — shiny, large pores, prone to acne', score: { vata: 0, pitta: 0, kapha: 3 } },
      { label: 'Sensitive/Combination — redness, reactive, inflamed', score: { vata: 0, pitta: 3, kapha: 0 } },
      { label: 'Normal — balanced, minimal issues', score: { vata: 1, pitta: 1, kapha: 1 } },
    ]},
    { text: 'What skin condition do you primarily experience?', options: [
      { label: 'Psoriasis — thick, scaly, silvery patches', score: { vata: 4, pitta: 1, kapha: 0 } },
      { label: 'Eczema / Atopic dermatitis — itchy, weeping', score: { vata: 2, pitta: 2, kapha: 1 } },
      { label: 'Acne — pimples, blackheads, oily', score: { vata: 0, pitta: 2, kapha: 3 } },
      { label: 'Rosacea or redness — flushing, burning skin', score: { vata: 0, pitta: 4, kapha: 0 } },
      { label: 'No significant skin condition', score: { vata: 0, pitta: 0, kapha: 0 } },
    ]},
    { text: 'What triggers your skin flares?', options: [
      { label: 'Stress, cold, wind, or dryness', score: { vata: 3, pitta: 0, kapha: 0 } },
      { label: 'Heat, sun, spicy food, or alcohol', score: { vata: 0, pitta: 3, kapha: 0 } },
      { label: 'Dairy, sugar, or humid weather', score: { vata: 0, pitta: 0, kapha: 3 } },
      { label: 'Multiple triggers / not sure', score: { vata: 1, pitta: 1, kapha: 1 } },
    ]},
    { text: 'How is your digestion?', sub: 'Gut-skin axis is central to Ayurvedic dermatology', options: [
      { label: 'Good — regular, no issues', score: { vata: 0, pitta: 0, kapha: 0 } },
      { label: 'Bloating, gas, irregular — often constipated', score: { vata: 3, pitta: 0, kapha: 0 } },
      { label: 'Acidity, heartburn, loose stools, inflammation', score: { vata: 0, pitta: 3, kapha: 0 } },
      { label: 'Sluggish — heavy feeling, slow digestion', score: { vata: 0, pitta: 0, kapha: 3 } },
    ]},
    { text: 'How would you rate your current stress levels?', options: [
      { label: 'Low — generally calm', score: { vata: 0, pitta: 0, kapha: 0 } },
      { label: 'Moderate — manageable', score: { vata: 1, pitta: 1, kapha: 0 } },
      { label: 'High — anxious, racing thoughts', score: { vata: 3, pitta: 1, kapha: 0 } },
      { label: 'Very high — overwhelmed, burnout', score: { vata: 2, pitta: 3, kapha: 0 } },
    ]},
  ];

  function scoreTest(answers) {
    let vata = 0, pitta = 0, kapha = 0;
    answers.forEach((a, i) => {
      if (a !== null) {
        vata  += questions[i].options[a].score.vata;
        pitta += questions[i].options[a].score.pitta;
        kapha += questions[i].options[a].score.kapha;
      }
    });
    const total = vata + pitta + kapha;
    const dominant = vata >= pitta && vata >= kapha ? 'Vata' : pitta >= kapha ? 'Pitta' : 'Kapha';
    return { vata, pitta, kapha, total, dominant };
  }

  function onComplete(answers, s) {
    const { vata, pitta, kapha, total, dominant } = s;
    const maxScore = 20;
    const risk = total <= 4 ? 'low' : total <= 10 ? 'moderate' : 'high';
    const conditionMap = { Vata: 'Vata-Type Skin (Dry/Psoriasis)', Pitta: 'Pitta-Type Skin (Reactive/Rosacea)', Kapha: 'Kapha-Type Skin (Oily/Acne)' };

    renderResult(container, {
      icon: '🌿', title: 'Skin Disorder Assessment',
      score: total, maxScore, category: conditionMap[dominant], riskLevel: risk,
      breakdown: [
        { icon: '💨', label: 'Vata Score', value: vata, sub: 'Dry, flaky, crackling' },
        { icon: '🔥', label: 'Pitta Score', value: pitta, sub: 'Red, hot, inflamed' },
        { icon: '💧', label: 'Kapha Score', value: kapha, sub: 'Oily, congested, pale' },
      ],
      ayurvedic: dominant === 'Vata'
        ? 'Vata-predominant skin disorders — Psoriasis (Kushtha), eczema with dryness, and cracking — arise from Vata disturbing Rasa and Rakta Dhatu. Treatment: Mahamarichyadi Taila (medicated oil), Panchakarma Snehana (oleation), Neem + Guduchi internally. Avoid cold, dry, raw foods.'
        : dominant === 'Pitta'
        ? 'Pitta skin — rosacea, contact dermatitis, sunburn-type reactions — reflects Pitta vitiation in Bhrajaka Pitta (skin Pitta). Cooling treatments: Chandan (sandalwood) paste, Kumkumadi Taila, Kaishore Guggulu for blood purification. Avoid spicy, sour, fermented foods.'
        : 'Kapha skin — acne, fungal issues, large pores — stems from excess Kapha and Meda accumulation in skin. Treatment: Neem + Turmeric paste externally, Triphala internally, Khadirarishta (blood purifier). Avoid dairy, sugar, and cold foods.',
      suggestions: [
        { icon: '🍽️', title: 'Skin-Healing Diet', text: dominant === 'Vata' ? 'Warm, oily, nourishing foods. Ghee, sesame oil, warm soups. Avoid cold, raw, and dry foods which aggravate Vata and worsen psoriasis/eczema.' : dominant === 'Pitta' ? 'Cooling, anti-inflammatory. Coconut water, cucumber, coriander, amla, coconut oil. Strictly avoid spicy food, alcohol, excess salt.' : 'Light, warm foods. No dairy, sugar, or fried foods. Bitter vegetables (karela, neem leaves) purify Kapha and clear skin.' },
        { icon: '🌿', title: 'Topical Ayurvedic Care', text: 'Neem oil (antimicrobial, anti-inflammatory), Kumkumadi Tailam (skin brightening, healing), Chandan paste (cooling for Pitta), Coconut + Turmeric (anti-bacterial). All are safe for daily use.' },
        { icon: '🫀', title: 'Gut-Skin Connection', text: 'Skin disorders are Ama (toxin) manifestations in Ayurveda. Triphala nightly, warm water with lemon in the morning, and fermented foods (buttermilk) rebuild gut microbiome — directly clearing skin.' },
        { icon: '🧴', title: 'Trigger Avoidance', text: dominant === 'Vata' ? 'Avoid stress, cold wind, harsh soaps, and synthetic fabrics. Stress is the #1 psoriasis trigger — Ashwagandha + Brahmi address this.' : dominant === 'Pitta' ? 'Avoid sun exposure 10am–4pm, alcohol, spicy food, and synthetic cosmetics. Rose water spray reduces Pitta flares immediately.' : 'Keep skin clean and dry. Avoid heavy creams and oils that clog pores. Neem face wash daily.' },
      ],
    });
  }

  container.appendChild(buildQuizTest({ icon: '🌿', title: 'Skin Disorder Screener', subtitle: '5 questions · Dosha skin type + trigger analysis + gut-skin link', questions, scoreTest, onComplete }));
}

// ══════════════════════════════════════════════════════════════
// 6. PRAKRUTI ASSESSMENT (Full 20-question Dosha Quiz)
// ══════════════════════════════════════════════════════════════
function renderPrakrutiTest(container) {
  const questions = [
    { text: 'My body frame is:', options: [
      { label: 'Thin, light, small bones, hard to gain weight', score: { v:3,p:0,k:0 } },
      { label: 'Medium, well-proportioned, athletic', score: { v:0,p:3,k:0 } },
      { label: 'Large, heavy, solid frame, gains weight easily', score: { v:0,p:0,k:3 } },
    ]},
    { text: 'My skin is naturally:', options: [
      { label: 'Dry, thin, rough, cool to touch', score: { v:3,p:0,k:0 } },
      { label: 'Warm, reddish, prone to inflammation/freckles', score: { v:0,p:3,k:0 } },
      { label: 'Thick, moist, smooth, oily', score: { v:0,p:0,k:3 } },
    ]},
    { text: 'My hair is:', options: [
      { label: 'Dry, frizzy, thin, breaks easily', score: { v:3,p:0,k:0 } },
      { label: 'Fine, straight, prematurely grey or thinning', score: { v:0,p:3,k:0 } },
      { label: 'Thick, wavy, lustrous, oily', score: { v:0,p:0,k:3 } },
    ]},
    { text: 'My appetite is:', options: [
      { label: 'Variable — sometimes hungry, sometimes not', score: { v:3,p:0,k:0 } },
      { label: 'Strong — get very hungry, irritable if meals delayed', score: { v:0,p:3,k:0 } },
      { label: 'Steady — can skip meals easily', score: { v:0,p:0,k:3 } },
    ]},
    { text: 'My digestion and stools are:', options: [
      { label: 'Irregular — often constipated, gas, bloating', score: { v:3,p:0,k:0 } },
      { label: 'Strong — loose, frequent, soft stools', score: { v:0,p:3,k:0 } },
      { label: 'Slow — regular but can be heavy/pale', score: { v:0,p:0,k:3 } },
    ]},
    { text: 'My sleep pattern is:', options: [
      { label: 'Light, interrupted, insomnia, vivid dreams', score: { v:3,p:0,k:0 } },
      { label: 'Moderate — wake easily but fall back asleep', score: { v:0,p:3,k:0 } },
      { label: 'Heavy, deep, love to sleep, hard to wake', score: { v:0,p:0,k:3 } },
    ]},
    { text: 'My mind and memory:', options: [
      { label: 'Quick to learn, quick to forget', score: { v:3,p:0,k:0 } },
      { label: 'Sharp, focused, critical, analytical', score: { v:0,p:3,k:0 } },
      { label: 'Slow to learn, excellent long-term memory', score: { v:0,p:0,k:3 } },
    ]},
    { text: 'Under stress I become:', options: [
      { label: 'Anxious, nervous, fearful, scattered', score: { v:3,p:0,k:0 } },
      { label: 'Irritable, angry, controlling, intense', score: { v:0,p:3,k:0 } },
      { label: 'Withdrawn, stubborn, lethargic, depressed', score: { v:0,p:0,k:3 } },
    ]},
    { text: 'My speech and communication style:', options: [
      { label: 'Fast, talkative, jumps topics, enthusiastic', score: { v:3,p:0,k:0 } },
      { label: 'Precise, direct, articulate, persuasive', score: { v:0,p:3,k:0 } },
      { label: 'Slow, melodious, thoughtful, careful', score: { v:0,p:0,k:3 } },
    ]},
    { text: 'My physical activity preference:', options: [
      { label: 'Light, creative, yoga, dance, walking', score: { v:3,p:0,k:0 } },
      { label: 'Competitive, goal-oriented, sports, challenge', score: { v:0,p:3,k:0 } },
      { label: 'Steady, endurance-based, dislike starting but persist', score: { v:0,p:0,k:3 } },
    ]},
  ];

  function scoreTest(answers) {
    let v = 0, p = 0, k = 0;
    answers.forEach((a, i) => {
      if (a !== null) { v += questions[i].options[a].score.v; p += questions[i].options[a].score.p; k += questions[i].options[a].score.k; }
    });
    return { v, p, k };
  }

  function onComplete(answers, s) {
    const { v, p, k } = s;
    const total = v + p + k;
    const dom = v >= p && v >= k ? 'Vata' : p >= k ? 'Pitta' : 'Kapha';
    const pct = Math.round(Math.max(v,p,k) / total * 100);
    const riskLevel = 'low';

    const doshaData = {
      Vata: {
        desc: 'Air & Space element — the principle of movement and creativity',
        traits: 'Creative, enthusiastic, quick-thinking, adaptable',
        imbalance: 'Anxiety, insomnia, dryness, constipation, weight loss',
        herbs: 'Ashwagandha, Shatavari, Triphala, Bala, Dashamoola',
        diet: 'Warm, oily, heavy, sweet, sour, salty foods. Ghee, warm milk, root vegetables. Avoid cold, raw, and dry foods.',
        colour: '#8B5E3C'
      },
      Pitta: {
        desc: 'Fire & Water element — the principle of transformation and intelligence',
        traits: 'Sharp, focused, goal-oriented, confident, passionate',
        imbalance: 'Inflammation, anger, acid reflux, skin rashes, burnout',
        herbs: 'Amalaki, Shatavari, Brahmi, Neem, Guduchi',
        diet: 'Cooling, sweet, bitter, astringent foods. Coconut water, cucumber, coriander. Avoid spicy, sour, and fermented foods.',
        colour: '#D4A017'
      },
      Kapha: {
        desc: 'Earth & Water element — the principle of structure and stability',
        traits: 'Calm, patient, strong, loyal, compassionate, stable',
        imbalance: 'Weight gain, congestion, lethargy, depression, attachment',
        herbs: 'Trikatu, Guggulu, Triphala, Punarnava, Chitrak',
        diet: 'Light, warm, dry, spicy, bitter foods. Honey, ginger, lemon. Avoid dairy, sweets, cold, and heavy foods.',
        colour: '#2D5E2E'
      }
    };

    const dd = doshaData[dom];

    const el = document.createElement('div');
    el.className = 'test-card';
    el.innerHTML = `
      <div class="test-header">
        <div class="test-header-icon">🧘</div>
        <div><h2>Prakruti Assessment — Results</h2><p>Your Ayurvedic birth constitution revealed</p></div>
      </div>
      <div class="test-results">
        <div class="results-hero-band" style="background:linear-gradient(145deg,${dd.colour},#1A0D04)">
          <div style="font-size:0.85rem;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,248,236,0.5);margin-bottom:0.5rem">Your Prakruti</div>
          <div class="result-big-score" style="font-size:3.5rem">${dom} ${pct}%</div>
          <div class="result-category">${dd.desc}</div>
          <div style="margin-top:1rem;font-size:0.9rem;color:rgba(255,248,236,0.65)">${dd.traits}</div>
          <div style="display:flex;gap:1rem;justify-content:center;margin-top:1.5rem">
            <div style="text-align:center"><div style="font-size:1.8rem;font-weight:900;color:var(--gold-light)">${v}</div><div style="font-size:0.75rem;color:rgba(255,248,236,0.5)">VATA</div></div>
            <div style="text-align:center"><div style="font-size:1.8rem;font-weight:900;color:var(--gold-light)">${p}</div><div style="font-size:0.75rem;color:rgba(255,248,236,0.5)">PITTA</div></div>
            <div style="text-align:center"><div style="font-size:1.8rem;font-weight:900;color:var(--gold-light)">${k}</div><div style="font-size:0.75rem;color:rgba(255,248,236,0.5)">KAPHA</div></div>
          </div>
        </div>

        <div class="result-breakdown">
          <div class="breakdown-card"><div class="bd-icon">⚠️</div><div class="bd-label">Imbalance Signs</div><div class="bd-value" style="font-size:0.9rem">${dd.imbalance.split(',')[0]}</div><div class="bd-sub">${dd.imbalance.split(',').slice(1).join(',')}</div></div>
          <div class="breakdown-card"><div class="bd-icon">🌿</div><div class="bd-label">Key Herbs</div><div class="bd-value" style="font-size:0.9rem">${dd.herbs.split(',')[0]}</div><div class="bd-sub">${dd.herbs.split(',').slice(1).join(',')}</div></div>
          <div class="breakdown-card"><div class="bd-icon">🍽️</div><div class="bd-label">Diet Principle</div><div class="bd-value" style="font-size:0.9rem">${dom === 'Vata' ? 'Warm & Oily' : dom === 'Pitta' ? 'Cool & Sweet' : 'Light & Dry'}</div><div class="bd-sub">Primary guideline</div></div>
        </div>

        <div class="ayur-result-card">
          <h3>ॐ Your ${dom} Lifestyle Guide</h3>
          <p><strong>Diet:</strong> ${dd.diet}</p>
        </div>

        <div class="result-suggestions">
          <h3>Daily Practices for ${dom} Balance</h3>
          <div class="sug-list">
            <div class="sug-item"><div class="sug-item-icon">🌅</div><div class="sug-item-body"><strong>Morning Dinacharya</strong><p>${dom === 'Vata' ? 'Warm oil Abhyanga (sesame oil), gentle yoga, warm breakfast. Avoid skipping meals — Vata worsens with irregularity.' : dom === 'Pitta' ? 'Coconut oil Abhyanga, cooling walk, light breakfast. Start your day calmly — avoid screens and arguments in the morning.' : 'Early rising (before 6am), vigorous exercise, light breakfast. Kapha worsens with oversleeping and sedentary mornings.'}</p></div></div>
            <div class="sug-item"><div class="sug-item-icon">🌿</div><div class="sug-item-body"><strong>Core Herbs</strong><p>${dd.herbs} — these herbs specifically nourish and balance ${dom} dosha. Start with one and add others gradually.</p></div></div>
            <div class="sug-item"><div class="sug-item-icon">🧘</div><div class="sug-item-body"><strong>Ideal Yoga Practice</strong><p>${dom === 'Vata' ? 'Slow, grounding yoga — Yin, Restorative, Hatha. Long holds, no rushing. Savasana is especially important.' : dom === 'Pitta' ? 'Moderate, non-competitive yoga — Sitali Pranayama (cooling breath), Moon Salutations, forward bends.' : 'Dynamic, warming yoga — Surya Namaskar, Kapalabhati Pranayama, backbends. Exercise intensely enough to sweat.'}</p></div></div>
            <div class="sug-item"><div class="sug-item-icon">🩺</div><div class="sug-item-body"><strong>Book Nadi Pariksha</strong><p>Our Ayurvedic physicians can confirm your Prakruti through Nadi Pariksha (pulse diagnosis) — 3000 years of diagnostic precision, now available in a free consultation.</p></div></div>
          </div>
        </div>

        <div class="result-cta">
          <h3>🙏 Deepen Your Prakruti Understanding</h3>
          <p>A 45-minute Nadi Pariksha session with our physicians reveals your Vikruti (current imbalance) vs your true Prakruti — and creates a personalised healing roadmap.</p>
          <div class="result-cta-btns">
            <a href="/consult" class="btn btn-primary">Book Nadi Pariksha ✦</a>
            <button class="btn btn-ghost" onclick="showHub()">← Back to Hub</button>
          </div>
        </div>
      </div>
    `;
    container.innerHTML = '';
    container.appendChild(el);
  }

  container.appendChild(buildQuizTest({ icon: '🧘', title: 'Prakruti Assessment', subtitle: '10 questions · Vata · Pitta · Kapha constitution analysis', questions, scoreTest, onComplete }));
}

// ══════════════════════════════════════════════════════════════
// 7. HAIR FALL TEST
// ══════════════════════════════════════════════════════════════
function renderHairfallTest(container) {
  const questions = [
    { text: 'How would you describe your hair loss pattern?', options: [
      { label: 'Diffuse — thinning all over scalp', score: 2 },
      { label: 'Patchy — irregular bald spots', score: 3 },
      { label: 'Receding hairline (temples/crown)', score: 3 },
      { label: 'Breakage — hair snapping, not falling from root', score: 1 },
      { label: 'Minimal hair loss', score: 0 },
    ]},
    { text: 'How much hair do you lose daily (estimate)?', options: [
      { label: '50–100 strands (normal)', score: 0 },
      { label: '100–200 strands (mild loss)', score: 2 },
      { label: '200–300 strands (moderate loss)', score: 3 },
      { label: '300+ strands (severe loss)', score: 5 },
    ]},
    { text: 'How long have you been experiencing hair loss?', options: [
      { label: 'Less than 1 month', score: 1 },
      { label: '1–6 months', score: 2 },
      { label: '6–12 months', score: 3 },
      { label: 'More than a year', score: 4 },
    ]},
    { text: 'Do you have any of these nutritional risk factors?', sub: 'Iron, B12, and Vitamin D deficiency are top causes', options: [
      { label: 'None — balanced omnivorous diet', score: 0 },
      { label: 'Vegetarian / vegan (B12 risk)', score: 2 },
      { label: 'Iron deficiency or anaemia diagnosed', score: 4 },
      { label: 'Low Vitamin D (indoor lifestyle / minimal sun)', score: 2 },
      { label: 'Multiple deficiencies or restrictive diet', score: 5 },
    ]},
    { text: 'How would you rate your stress levels over the past 6 months?', options: [
      { label: 'Low — generally calm', score: 0 },
      { label: 'Moderate — occasional stress', score: 1 },
      { label: 'High — chronic work/personal stress', score: 3 },
      { label: 'Extreme — major life event or trauma', score: 5 },
    ]},
    { text: 'How is your scalp condition?', options: [
      { label: 'Normal — no itching or flaking', score: 0 },
      { label: 'Dry — itchy without flakes', score: 1 },
      { label: 'Dandruff — white/yellow flakes', score: 2 },
      { label: 'Oily with flakes (seborrhoeic dermatitis)', score: 3 },
    ]},
    { text: 'Family history of hair loss?', options: [
      { label: 'No family history', score: 0 },
      { label: 'One parent with thinning', score: 2 },
      { label: 'Both parents or multiple relatives', score: 4 },
    ]},
  ];

  function scoreTest(answers) {
    let total = 0;
    answers.forEach((a, i) => { if (a !== null) total += questions[i].options[a].score; });
    return total;
  }

  function onComplete(answers, score) {
    const maxScore = 28;
    let category, risk;
    if (score <= 5) { category = 'Minimal Hair Fall — Normal Range'; risk = 'low'; }
    else if (score <= 12) { category = 'Moderate Hair Fall — Intervention Recommended'; risk = 'moderate'; }
    else { category = 'Significant Hair Loss — Medical + Ayurvedic Care Needed'; risk = 'high'; }

    const nutritionRisk = (answers[3] ?? 0) >= 2;
    const stressRisk    = (answers[4] ?? 0) >= 2;
    const geneticRisk   = (answers[6] ?? 0) >= 1;

    renderResult(container, {
      icon: '💇', title: 'Hair Fall Assessment',
      score, maxScore, category, riskLevel: risk,
      breakdown: [
        { icon: '🧬', label: 'Genetic Risk', value: geneticRisk ? 'Present' : 'Low', sub: 'Androgenic alopecia' },
        { icon: '🥗', label: 'Nutritional Risk', value: nutritionRisk ? 'Detected' : 'Low', sub: 'Iron/B12/Vit D' },
        { icon: '😰', label: 'Stress Factor', value: stressRisk ? 'High' : 'Low', sub: 'Telogen effluvium' },
      ],
      ayurvedic: score <= 5
        ? 'Your hair fall is within normal range. In Ayurveda, healthy hair (Kesha) reflects strong Asthi Dhatu (bone tissue) and balanced Vata. Maintain with Bhringraj oil massage, Amalaki internally, and Nasya therapy.'
        : score <= 12
        ? 'Moderate Khalitya (hair fall) often reflects Pitta aggravation in the scalp — seen in stress-related and nutritional hair loss. Bhringraj + Brahmi oil, Triphala + Amalaki internally, and scalp Shirodhara therapy are indicated.'
        : 'Significant hair loss requires comprehensive care. Ayurveda identifies this as Pitta-Vata imbalance in Asthi Vaha Srotas. Nasya (medicated oil in nostrils), Shirodhara, Triphala Churna, Ashwagandha, and correction of nutritional deficiencies are the classical protocol.',
      suggestions: [
        { icon: '🪔', title: 'Bhringraj Oil Massage', text: 'Bhringraj (Eclipta alba) is clinically proven to promote hair growth comparable to minoxidil in some studies. Heat coconut oil with Bhringraj powder, massage into scalp 3x/week, leave for 1 hour, then wash.' },
        nutritionRisk
          ? { icon: '💊', title: 'Address Nutrient Deficiencies', text: 'Get serum ferritin (iron stores), Vitamin B12, Vitamin D, and zinc tested. Ferritin below 70 ng/mL is associated with hair loss even without clinical anaemia. Supplement under medical guidance.' }
          : { icon: '🥗', title: 'Hair-Building Diet', text: 'Protein is the building block of hair — ensure 0.8–1g/kg body weight daily. Biotin-rich foods (eggs, almonds, sweet potato), Iron (spinach, lentils), and Vitamin C (amla) for iron absorption.' },
        stressRisk
          ? { icon: '🧘', title: 'Stress is the Top Cause', text: 'Telogen effluvium (stress hair loss) can cause massive shedding 2–4 months after a stressful event. Ashwagandha (reduces cortisol by 28%), Brahmi, and daily Pranayama are clinically effective.' }
          : { icon: '💆', title: 'Scalp Health', text: answers[5] >= 2 ? 'Treat dandruff first — it drives hair fall by inflaming follicles. Neem + Tea tree shampoo 3x/week. Internally, Khadirarishta purifies the blood and clears scalp conditions.' : 'Keep scalp clean and well-circulated. Cold water rinse (not hot) after washing preserves the hair cuticle. Avoid tight hairstyles and heat styling.' },
        { icon: '🌿', title: 'Ayurvedic Protocol', text: 'Neelibhringadi Oil (traditional Keralan formula), Amalaki + Bhringraj internally, Brahmi Ghrita, and monthly Shirodhara (medicated oil stream on forehead). The combination addresses both internal and external causes.' },
      ],
    });
  }

  container.appendChild(buildQuizTest({ icon: '💇', title: 'Hair Fall Assessment', subtitle: '7 questions · Pattern classification · Nutrient risk · Scalp health', questions, scoreTest, onComplete }));
}

// ══════════════════════════════════════════════════════════════
// 8. SNELLEN EYE TEST — Clinically Rigorous Implementation
// ══════════════════════════════════════════════════════════════
function renderEyeTest(container) {

  /* ── SLOAN letter set (standardised for acuity testing) ── */
  const SLOAN = ['C','D','H','K','N','O','R','S','V','Z'];

  /* ── Snellen rows: acuity + letter height at 6 m standard distance (mm) ── */
  const ROWS = [
    { acuity:'20/200', mm:87.3, label:'Large Print — Severe Impairment' },
    { acuity:'20/100', mm:43.7, label:'Low Vision Threshold' },
    { acuity:'20/70',  mm:30.5, label:'Significant Impairment' },
    { acuity:'20/50',  mm:21.8, label:'Moderate Impairment' },
    { acuity:'20/40',  mm:17.5, label:'Mild Impairment' },
    { acuity:'20/30',  mm:13.1, label:'Near Normal' },
    { acuity:'20/25',  mm:10.9, label:'Near Normal' },
    { acuity:'20/20',  mm:8.73, label:'Normal Vision' },
    { acuity:'20/15',  mm:6.55, label:'Better Than Normal' },
  ];

  const LETTERS_PER_ROW = 5;   // Sloan letters shown per line (clinical standard)
  const PASS_THRESHOLD  = 4;   // need 4/5 correct to pass a row (standard clinical pass)

  /* ── Persistent state ── */
  let screenPPI     = 96;
  let viewingDistCm = 60;
  let currentEye    = 'right';
  let rightAcuity   = null;
  let leftAcuity    = null;

  /* per-eye state (reset each eye) */
  let rowIdx        = 4;    // start at 20/40 — clinical mid-point
  let rowLetters    = [];
  let userAnswers   = [];
  let answerIdx     = 0;
  let lastPassedRow = -1;
  let testDone      = false;

  /* ── Helpers ── */
  function mmToPx(mm) {
    /* Scale letter from standard 6m to actual viewing distance.
       h_px = (mm_at_6m / 25.4) * PPI * (viewingDist / 600)            */
    return Math.max(Math.round((mm / 25.4) * screenPPI * (viewingDistCm / 600)), 14);
  }

  function pickLetters() {
    const pool = [...SLOAN];
    const result = [];
    for (let i = 0; i < LETTERS_PER_ROW; i++) {
      const r = Math.floor(Math.random() * pool.length);
      result.push(pool.splice(r, 1)[0]);
    }
    return result;
  }

  function wrongChoices(correct, n) {
    const pool = SLOAN.filter(c => c !== correct);
    const out = [];
    while (out.length < n) {
      const r = pool[Math.floor(Math.random() * pool.length)];
      if (!out.includes(r)) out.push(r);
    }
    return out;
  }

  function resetEyeState() {
    rowIdx        = 4;
    rowLetters    = pickLetters();
    userAnswers   = [];
    answerIdx     = 0;
    lastPassedRow = -1;
    testDone      = false;
  }

  /* ── PHASE 1: Calibration ── */
  function renderCalibration() {
    const el = document.createElement('div');
    el.className = 'test-card';
    el.innerHTML = `
      <div class="test-header">
        <div class="test-header-icon">👁️</div>
        <div>
          <h2>Snellen Visual Acuity Test</h2>
          <p>Clinically-calibrated  ·  5 letters per row  ·  Each eye tested separately</p>
        </div>
      </div>
      <div class="eye-calibrate">

        <div class="eye-how-it-works">
          <h3>How This Test Works</h3>
          <div class="eye-steps-row">
            <div class="eye-step"><span class="eye-step-num">1</span><span>Calibrate screen with a physical object</span></div>
            <div class="eye-step-arrow">→</div>
            <div class="eye-step"><span class="eye-step-num">2</span><span>Set your viewing distance</span></div>
            <div class="eye-step-arrow">→</div>
            <div class="eye-step"><span class="eye-step-num">3</span><span>Read 5 letters per row — one at a time</span></div>
            <div class="eye-step-arrow">→</div>
            <div class="eye-step"><span class="eye-step-num">4</span><span>Separate acuity score for each eye</span></div>
          </div>
          <div class="eye-protocol-note">
            Clinical protocol: 4 out of 5 letters must be correct to pass a row. The test uses a staircase method — moving to smaller letters when you pass and larger when you fail — to accurately locate your acuity threshold.
          </div>
        </div>

        <div class="eye-checklist">
          <h3>Before You Begin ✓</h3>
          <label class="eye-check-item"><input type="checkbox" id="chk1"/> <span>I am wearing my usual glasses or contact lenses (if applicable)</span></label>
          <label class="eye-check-item"><input type="checkbox" id="chk2"/> <span>The room is well lit and my screen brightness is comfortable</span></label>
          <label class="eye-check-item"><input type="checkbox" id="chk3"/> <span>I have something ready to cover one eye (hand, paper, or cloth)</span></label>
          <p class="eye-check-note">⚠️ This test measures acuity <strong>with correction</strong>. Keep your glasses on.</p>
        </div>

        <div class="eye-cal-section">
          <h3>Step 1 — Screen Calibration</h3>
          <p style="font-size:0.88rem;color:var(--text-muted);margin-bottom:1rem">Select a physical reference object. Drag the slider until the on-screen shape matches your object exactly. This calculates your screen's pixel density so letters render at the correct physical size.</p>
          <div class="calibrate-options">
            <div class="cal-opt active" data-cal="coin"  data-mm="27"    data-shape="circle"><div class="cal-opt-icon">🪙</div><strong>₹10 Coin</strong><span>⌀ 27mm</span></div>
            <div class="cal-opt"        data-cal="card"  data-mm="85.6"  data-shape="rect"  ><div class="cal-opt-icon">💳</div><strong>Bank Card</strong><span>85.6mm wide</span></div>
            <div class="cal-opt"        data-cal="ruler" data-mm="50"    data-shape="rect"  ><div class="cal-opt-icon">📏</div><strong>Ruler</strong><span>Match 50mm</span></div>
            <div class="cal-opt"        data-cal="a4"    data-mm="210"   data-shape="rect"  ><div class="cal-opt-icon">📄</div><strong>A4 Paper</strong><span>210mm wide</span></div>
            <div class="cal-opt"        data-cal="skip"  data-mm="0"     data-shape="none"  ><div class="cal-opt-icon">⏭️</div><strong>Skip</strong><span>96 PPI default</span></div>
          </div>

          <div id="calSliderWrap" class="cal-slider-wrap">
            <div class="cal-slider-label" id="calInstruction">Hold your ₹10 coin (27mm diameter) flat against the screen. Drag the slider until the circle matches:</div>
            <input type="range" id="calSlider" min="20" max="700" value="103" style="width:100%;accent-color:var(--gold);margin:0.75rem 0"/>
            <div class="cal-shape-container">
              <div class="cal-shape" id="calShape" style="width:103px;height:103px;border-radius:50%"></div>
            </div>
            <div class="cal-ppi-display" id="calPPIDisplay">Estimated screen PPI: 96</div>
          </div>
        </div>

        <div class="eye-cal-section" style="margin-top:1.5rem">
          <h3>Step 2 — Viewing Distance</h3>
          <p style="font-size:0.88rem;color:var(--text-muted);margin-bottom:0.75rem">Sit where you normally sit. Measure or estimate your distance from the screen. 55–65 cm is typical for a laptop.</p>
          <div class="dist-slider-wrap">
            <input type="range" id="distSlider" min="25" max="120" value="60" style="width:100%;accent-color:var(--gold);margin:0.75rem 0"/>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span style="font-size:0.82rem;color:var(--text-muted)">25 cm</span>
              <div style="text-align:center;font-size:2rem;font-weight:900;color:var(--gold)" id="distDisplay">60 cm</div>
              <span style="font-size:0.82rem;color:var(--text-muted)">120 cm</span>
            </div>
            <p style="text-align:center;font-size:0.82rem;color:var(--text-muted);margin-top:0.5rem">💡 Your arm-span (~60–70cm) is a handy measuring tool</p>
          </div>
        </div>

        <button class="btn btn-primary" id="startEyeBtn" style="width:100%;margin-top:2rem;justify-content:center" disabled>
          ✦ Begin Eye Test — Right Eye First
        </button>
        <p style="font-size:0.78rem;color:var(--text-muted);text-align:center;margin-top:0.75rem">⚠️ Screening only — does not replace a clinical examination by an optometrist or ophthalmologist.</p>
      </div>
    `;
    container.innerHTML = '';
    container.appendChild(el);

    let selectedMm = 27;
    let selectedShape = 'circle';
    const calSlider = el.querySelector('#calSlider');
    const calShapeEl = el.querySelector('#calShape');
    const calInstEl = el.querySelector('#calInstruction');
    const calPPIEl = el.querySelector('#calPPIDisplay');
    const startBtn = el.querySelector('#startEyeBtn');
    const calWrap = el.querySelector('#calSliderWrap');

    function updateCalShape() {
      const px = parseInt(calSlider.value);
      calShapeEl.style.width = px + 'px';
      calShapeEl.style.height = selectedShape === 'circle' ? px + 'px' : '55px';
      calShapeEl.style.borderRadius = selectedShape === 'circle' ? '50%' : '8px';
      if (selectedMm > 0) {
        screenPPI = (px / selectedMm) * 25.4;
        calPPIEl.textContent = `Estimated screen PPI: ${Math.round(screenPPI)} · Confirmed size: ~${Math.round(px / screenPPI * 25.4)}mm`;
      }
    }
    calSlider.addEventListener('input', updateCalShape);

    const instructionMap = {
      coin:   'Hold your ₹10 coin (27mm diameter) flat against the screen. Drag the slider until the circle matches exactly:',
      card:   'Hold any bank/Aadhaar card (85.6mm wide) against the screen. Drag until the rectangle matches its full width:',
      ruler:  'Place a ruler against the screen. Drag until the rectangle matches exactly 50mm:',
      a4:     'Hold an A4 sheet against the screen. Drag until the rectangle matches the full 210mm width:',
    };
    el.querySelectorAll('.cal-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        el.querySelectorAll('.cal-opt').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        selectedMm = parseFloat(opt.dataset.mm);
        selectedShape = opt.dataset.shape;
        if (opt.dataset.cal === 'skip') {
          screenPPI = 96;
          calWrap.style.display = 'none';
          calPPIEl.textContent = 'Using default 96 PPI (approximate results)';
          calPPIEl.style.display = 'block';
        } else {
          calWrap.style.display = '';
          calInstEl.textContent = instructionMap[opt.dataset.cal] || '';
          updateCalShape();
        }
      });
    });

    const distSlider = el.querySelector('#distSlider');
    const distDisplay = el.querySelector('#distDisplay');
    distSlider.addEventListener('input', () => {
      viewingDistCm = parseInt(distSlider.value);
      distDisplay.textContent = viewingDistCm + ' cm';
    });

    [1,2,3].forEach(n => {
      el.querySelector('#chk' + n).addEventListener('change', () => {
        const allChecked = [1,2,3].every(m => el.querySelector('#chk' + m).checked);
        startBtn.disabled = !allChecked;
      });
    });

    startBtn.addEventListener('click', () => {
      currentEye = 'right';
      resetEyeState();
      renderEyeIntro();
    });
  }

  /* ── PHASE 2: Eye intro ── */
  function renderEyeIntro() {
    const isRight = currentEye === 'right';
    const el = document.createElement('div');
    el.className = 'test-card';
    el.innerHTML = `
      <div class="test-header">
        <div class="test-header-icon">${isRight ? '👁' : '👁'}</div>
        <div>
          <h2>${isRight ? 'Right Eye Test' : 'Left Eye Test'}</h2>
          <p>${isRight ? 'Cover your LEFT eye. Test with RIGHT eye only.' : 'Cover your RIGHT eye. Test with LEFT eye only.'}</p>
        </div>
      </div>
      <div class="eye-calibrate" style="text-align:center">
        <div class="eye-cover-diagram">
          <div class="ecd-eye ${isRight ? 'ecd-covered' : 'ecd-open'}">
            <div class="ecd-label">LEFT</div>
            <div class="ecd-symbol">${isRight ? '🚫' : '👁️'}</div>
            <div class="ecd-status">${isRight ? 'COVER' : 'OPEN'}</div>
          </div>
          <div class="ecd-center">👃</div>
          <div class="ecd-eye ${isRight ? 'ecd-open' : 'ecd-covered'}">
            <div class="ecd-label">RIGHT</div>
            <div class="ecd-symbol">${isRight ? '👁️' : '🚫'}</div>
            <div class="ecd-status">${isRight ? 'OPEN' : 'COVER'}</div>
          </div>
        </div>
        <p style="max-width:400px;margin:1rem auto;font-size:0.93rem;line-height:1.7;color:var(--text-muted)">
          Use your ${isRight ? 'left' : 'right'} hand, a folded piece of paper, or a cloth to completely cover your
          <strong>${isRight ? 'LEFT' : 'RIGHT'} eye</strong>.<br/><br/>
          <strong>Do not press on your eye.</strong> Simply block the view.
          Keep it covered throughout the entire test.
        </p>
        <div style="background:rgba(212,160,23,0.07);border:1px solid rgba(212,160,23,0.2);border-radius:12px;padding:1.2rem;margin:1.2rem 0;font-size:0.87rem;color:var(--text-muted);text-align:left;max-width:480px;margin-left:auto;margin-right:auto">
          <strong>Test Method:</strong> You will see one Sloan letter at a time from a row of ${LETTERS_PER_ROW} letters.
          After you answer each letter, the next appears automatically.
          You need <strong>${PASS_THRESHOLD} out of ${LETTERS_PER_ROW}</strong> correct to pass a row.
          The test adaptively moves to smaller or larger letters to find your exact acuity level.
          You can also press the <strong>letter key on your keyboard</strong> to answer.
        </div>
        <button class="btn btn-primary" id="beginLettersBtn" style="width:100%;justify-content:center">
          ✦ I'm Ready — Begin
        </button>
      </div>
    `;
    container.innerHTML = '';
    container.appendChild(el);
    el.querySelector('#beginLettersBtn').addEventListener('click', () => {
      answerIdx = 0;
      userAnswers = [];
      renderLetterTrial();
    });
  }

  /* ── PHASE 3: Letter-by-letter trial ── */
  function renderLetterTrial() {
    const row    = ROWS[rowIdx];
    const px     = mmToPx(row.mm);
    const letter = rowLetters[answerIdx];
    const choices = [letter, ...wrongChoices(letter, 3)].sort(() => Math.random() - 0.5);

    const progressPips = rowLetters.map((l, i) => {
      if (i < answerIdx) {
        const ok = userAnswers[i] === l;
        return `<span class="row-letter-pip ${ok ? 'pip-correct' : 'pip-wrong'}" title="${ok ? 'Correct' : 'Wrong'}">${ok ? '✓' : '✗'}</span>`;
      } else if (i === answerIdx) {
        return `<span class="row-letter-pip pip-current">●</span>`;
      }
      return `<span class="row-letter-pip pip-pending">○</span>`;
    }).join('');

    const el = document.createElement('div');
    el.className = 'test-card';
    el.innerHTML = `
      <div class="test-header">
        <div class="test-header-icon">👁️</div>
        <div>
          <h2>${currentEye === 'right' ? '👁 Right Eye' : '👁 Left Eye'} — Line ${rowIdx + 1}</h2>
          <p>Row: <strong>${row.acuity}</strong> · Letter <strong>${answerIdx + 1}</strong> of ${LETTERS_PER_ROW}</p>
        </div>
      </div>

      <div class="snellen-chart-sidebar">
        ${ROWS.map((r, i) => `
          <div class="scs-row ${i === rowIdx ? 'scs-active' : i < rowIdx ? 'scs-completed' : 'scs-future'}">
            <span class="scs-acuity">${r.acuity}</span>
            <div class="scs-indicator">${i === rowIdx ? progressPips : (i < rowIdx ? '✓' : '')}</div>
          </div>
        `).join('')}
      </div>

      <div class="eye-cover-guide">
        🤚 Cover your <strong>${currentEye === 'right' ? 'LEFT' : 'RIGHT'} eye</strong>. Read with ${currentEye.toUpperCase()} eye only.
      </div>

      <div class="snellen-letter-wrap">
        <div class="snellen-letter-display" id="snellenLetter" style="font-size:${px}px">
          ${letter}
        </div>
        <div class="snellen-row-info">${row.acuity} · ${row.label} · Letter ${answerIdx + 1}/${LETTERS_PER_ROW}</div>
      </div>

      <div class="snellen-answer-section">
        <p class="snellen-select-hint">Which letter do you see?</p>
        <div class="snellen-choices" id="snellenChoices">
          ${choices.map(c => `<button class="snellen-choice" data-letter="${c}">${c}</button>`).join('')}
        </div>
        <p class="snellen-keyboard-hint">💡 Tip: You can also press the letter key on your keyboard</p>
      </div>
    `;
    container.innerHTML = '';
    container.appendChild(el);

    function handleAnswer(chosen) {
      el.querySelectorAll('.snellen-choice').forEach(b => {
        b.disabled = true;
        if (b.dataset.letter === chosen) b.classList.add(chosen === letter ? 'correct' : 'wrong');
        if (b.dataset.letter === letter) b.classList.add('correct');
      });
      document.removeEventListener('keydown', onKey);
      userAnswers.push(chosen);
      answerIdx++;
      setTimeout(() => {
        if (answerIdx < LETTERS_PER_ROW) {
          renderLetterTrial();
        } else {
          evaluateRow();
        }
      }, chosen === letter ? 500 : 1100);
    }

    el.querySelectorAll('.snellen-choice').forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(btn.dataset.letter));
    });

    function onKey(e) {
      const key = e.key.toUpperCase();
      if (SLOAN.includes(key)) {
        document.removeEventListener('keydown', onKey);
        handleAnswer(key);
      }
    }
    document.addEventListener('keydown', onKey);
  }

  /* ── Evaluate a completed row ── */
  function evaluateRow() {
    const correctCount = userAnswers.filter((ans, i) => ans === rowLetters[i]).length;
    const passed = correctCount >= PASS_THRESHOLD;
    renderRowFeedback(correctCount, passed);
  }

  /* ── Brief row feedback before advancing ── */
  function renderRowFeedback(correct, passed) {
    const row = ROWS[rowIdx];
    const letterBreakdown = rowLetters.map((shown, i) => {
      const ans = userAnswers[i];
      const ok = ans === shown;
      return `<div class="lc-item ${ok ? 'lc-ok' : 'lc-fail'}">
        <span class="lc-shown">${shown}</span>
        <span class="lc-arrow">→</span>
        <span class="lc-given">${ans}</span>
        <span class="lc-result">${ok ? '✓' : '✗'}</span>
      </div>`;
    }).join('');

    const progHint = passed
      ? (rowIdx < ROWS.length - 1 ? `Moving to smaller letters (${ROWS[rowIdx+1].acuity}) ↓` : 'You read the smallest line! 🏆')
      : (rowIdx > 0 ? `Moving to larger letters (${ROWS[rowIdx-1].acuity}) ↑` : 'Bottom of chart reached.');

    const el = document.createElement('div');
    el.className = 'test-card';
    el.innerHTML = `
      <div class="test-header">
        <div class="test-header-icon">${passed ? '✅' : '❌'}</div>
        <div>
          <h2>${passed ? 'Row Passed!' : 'Row Failed'} — ${row.acuity}</h2>
          <p>${correct} out of ${LETTERS_PER_ROW} correct (need ${PASS_THRESHOLD} to pass)</p>
        </div>
      </div>
      <div class="row-feedback-wrap">
        <div class="rfw-score ${passed ? 'rfw-pass' : 'rfw-fail'}">
          <span class="rfw-num">${correct}</span><span class="rfw-denom">/${LETTERS_PER_ROW}</span>
        </div>
        <div class="lc-grid">${letterBreakdown}</div>
        <div class="rfw-next">${progHint}</div>
      </div>
    `;
    container.innerHTML = '';
    container.appendChild(el);
    setTimeout(() => advanceRow(passed), 2200);
  }

  /* ── Staircase advancement ── */
  function advanceRow(passed) {
    if (passed) {
      lastPassedRow = rowIdx;
      if (rowIdx < ROWS.length - 1) {
        rowIdx++;
        rowLetters = pickLetters();
        answerIdx = 0;
        userAnswers = [];
        renderLetterTrial();
      } else {
        finishEye(); // topped out at 20/15
      }
    } else {
      // Failed
      if (lastPassedRow >= 0 && rowIdx === lastPassedRow + 1) {
        // We passed all rows up to lastPassedRow and just failed the next — done
        finishEye();
      } else if (rowIdx === 0) {
        // Can't go larger
        finishEye();
      } else {
        rowIdx--;
        rowLetters = pickLetters();
        answerIdx = 0;
        userAnswers = [];
        renderLetterTrial();
      }
    }
  }

  /* ── Finish one eye ── */
  function finishEye() {
    const acuity = lastPassedRow >= 0 ? ROWS[lastPassedRow].acuity : '<20/200';
    if (currentEye === 'right') {
      rightAcuity = acuity;
      renderSwitchScreen();
    } else {
      leftAcuity = acuity;
      renderEyeResults();
    }
  }

  /* ── Switch screen ── */
  function renderSwitchScreen() {
    const el = document.createElement('div');
    el.className = 'test-card';
    el.innerHTML = `
      <div class="test-header">
        <div class="test-header-icon">✅</div>
        <div><h2>Right Eye — Complete</h2><p>Acuity recorded: <strong>${rightAcuity}</strong> · ${acuityLabel(rightAcuity)}</p></div>
      </div>
      <div class="eye-calibrate" style="text-align:center">
        <div class="eye-switch-icon">↔️</div>
        <h3>Switch: Now Cover Your RIGHT Eye</h3>
        <p style="max-width:400px;margin:1rem auto;font-size:0.93rem;line-height:1.7;color:var(--text-muted)">
          Cover your <strong>RIGHT eye</strong> with your right hand or a piece of paper.
          Keep your <strong>LEFT eye</strong> open and uncovered.<br/><br/>
          The left eye test will restart from the beginning. Take a moment to relax your eyes before continuing.
        </p>
        <div class="eye-result-mini-card">
          <span>Right Eye Result</span>
          <strong>${rightAcuity}</strong>
          <span>${acuityLabel(rightAcuity)}</span>
        </div>
        <button class="btn btn-primary" id="startLeftBtn" style="margin-top:2rem;width:100%;justify-content:center">
          ✦ Begin Left Eye Test →
        </button>
      </div>
    `;
    container.innerHTML = '';
    container.appendChild(el);
    el.querySelector('#startLeftBtn').addEventListener('click', () => {
      currentEye = 'left';
      resetEyeState();
      renderEyeIntro();
    });
  }

  /* ── Acuity helpers ── */
  function acuityLabel(acuity) {
    const map = {
      '20/15':   'Better Than Normal',
      '20/20':   'Normal — 20/20',
      '20/25':   'Near Normal',
      '20/30':   'Mild Reduction',
      '20/40':   'Mild Impairment',
      '20/50':   'Moderate — Glasses Advised',
      '20/70':   'Moderate — See Optometrist',
      '20/100':  'Significant — See Doctor',
      '20/200':  'Severe — Urgent Review',
      '<20/200': 'Below 20/200 — Urgent Review',
    };
    return map[acuity] || 'Undetermined';
  }

  function acuityRisk(acuity) {
    if (['20/15','20/20','20/25'].includes(acuity)) return 'low';
    if (['20/30','20/40','20/50'].includes(acuity)) return 'moderate';
    return 'high';
  }

  function acuityRank(acuity) {
    const ranks = { '20/15':9,'20/20':8,'20/25':7,'20/30':6,'20/40':5,'20/50':4,'20/70':3,'20/100':2,'20/200':1,'<20/200':0 };
    return ranks[acuity] ?? 0;
  }

  /* ── Final Results ── */
  function renderEyeResults() {
    const rRisk = acuityRisk(rightAcuity);
    const lRisk = acuityRisk(leftAcuity);
    const overallRisk = (rRisk === 'high' || lRisk === 'high') ? 'high'
                      : (rRisk === 'moderate' || lRisk === 'moderate') ? 'moderate' : 'low';
    const rankDiff = Math.abs(acuityRank(rightAcuity) - acuityRank(leftAcuity));
    const asymmetric = rankDiff >= 1;
    const bigAsymmetry = rankDiff >= 3;
    const riskClass = { low:'risk-low', moderate:'risk-moderate', high:'risk-high' };

    const el = document.createElement('div');
    el.className = 'test-card';
    el.innerHTML = `
      <div class="test-header">
        <div class="test-header-icon">👁️</div>
        <div><h2>Eye Test — Results</h2><p>Snellen visual acuity · Both eyes tested · ${LETTERS_PER_ROW} letters per row · ${PASS_THRESHOLD}/${LETTERS_PER_ROW} pass threshold</p></div>
      </div>
      <div class="test-results">

        <div class="results-hero-band">
          <div class="eye-result-compare">
            <div class="eye-result-eye ${rRisk === 'low' ? 'eye-result-good' : rRisk === 'moderate' ? 'eye-result-warn' : 'eye-result-bad'}">
              <div class="eye-result-side">RIGHT EYE</div>
              <div class="eye-acuity">${rightAcuity}</div>
              <div class="eye-verdict">${acuityLabel(rightAcuity)}</div>
              <span class="risk-tag ${riskClass[rRisk]}" style="margin-top:0.5rem;display:inline-block">${rRisk.toUpperCase()}</span>
            </div>
            <div class="eye-vs">VS</div>
            <div class="eye-result-eye ${lRisk === 'low' ? 'eye-result-good' : lRisk === 'moderate' ? 'eye-result-warn' : 'eye-result-bad'}">
              <div class="eye-result-side">LEFT EYE</div>
              <div class="eye-acuity">${leftAcuity}</div>
              <div class="eye-verdict">${acuityLabel(leftAcuity)}</div>
              <span class="risk-tag ${riskClass[lRisk]}" style="margin-top:0.5rem;display:inline-block">${lRisk.toUpperCase()}</span>
            </div>
          </div>

          <div class="acuity-scale">
            <div class="acuity-scale-label">Visual Acuity Scale — Where Your Eyes Sit</div>
            <div class="acuity-scale-bar">
              ${ROWS.map(r => {
                const isR = r.acuity === rightAcuity;
                const isL = r.acuity === leftAcuity;
                return `<div class="asb-cell ${isR && isL ? 'asb-both' : isR ? 'asb-right' : isL ? 'asb-left' : ''}" title="${r.acuity}">
                  <div class="asb-tick">${r.acuity}</div>
                  ${isR && isL ? '<div class="asb-marker asb-both-m">R+L</div>' : isR ? '<div class="asb-marker asb-r">R</div>' : isL ? '<div class="asb-marker asb-l">L</div>' : ''}
                </div>`;
              }).join('')}
            </div>
            <div class="acuity-scale-ends"><span>← Better Vision</span><span>Worse Vision →</span></div>
          </div>
        </div>

        ${bigAsymmetry ? `
        <div class="eye-alert eye-alert-warn">
          ⚠️ <strong>Significant inter-eye difference detected</strong> — Right eye (${rightAcuity}) vs Left eye (${leftAcuity}) differ by ${rankDiff} acuity levels.
          This may indicate amblyopia (lazy eye), uncorrected refractive error in one eye (anisometropia), or a monocular pathology.
          A clinical refraction test and fundus examination are strongly recommended.
        </div>` : asymmetric ? `
        <div class="eye-alert eye-alert-info">
          ℹ️ A small difference between eyes was detected (${rightAcuity} vs ${leftAcuity}). Minor asymmetries are common and may simply reflect natural variation or a mild refractive difference. A routine optometrist review is advisable.
        </div>` : ''}

        <div class="result-breakdown">
          <div class="breakdown-card">
            <div class="bd-icon">📊</div>
            <div class="bd-label">Overall Acuity</div>
            <div class="bd-value">${overallRisk === 'low' ? 'Normal' : overallRisk === 'moderate' ? 'Reduced' : 'Impaired'}</div>
            <div class="bd-sub">${overallRisk === 'low' ? 'Both eyes within normal range' : 'Professional review recommended'}</div>
          </div>
          <div class="breakdown-card">
            <div class="bd-icon">👓</div>
            <div class="bd-label">Correction Need</div>
            <div class="bd-value">${overallRisk === 'low' ? 'Unlikely' : overallRisk === 'moderate' ? 'Likely' : 'Required'}</div>
            <div class="bd-sub">${overallRisk === 'low' ? 'No correction indicated' : 'Glasses or contacts may help'}</div>
          </div>
          <div class="breakdown-card">
            <div class="bd-icon">🏥</div>
            <div class="bd-label">Next Eye Check</div>
            <div class="bd-value">${overallRisk === 'low' ? '2–3 Years' : overallRisk === 'moderate' ? 'Within 6 months' : 'Within 4 weeks'}</div>
            <div class="bd-sub">Recommended timeline</div>
          </div>
        </div>

        <div class="eye-explainer">
          <h3>📖 What Do These Numbers Mean?</h3>
          <div class="explainer-grid">
            <div class="explainer-item"><strong>20/20</strong><span>You read at 20 feet what a person with normal vision reads at 20 feet. The global standard benchmark.</span></div>
            <div class="explainer-item"><strong>20/40</strong><span>You need to be at 20ft to see what normal vision sees at 40ft. Minimum legal driving standard in most countries.</span></div>
            <div class="explainer-item"><strong>20/200</strong><span>Legal blindness threshold. You need to be 20ft away to see what normal vision sees at 200ft.</span></div>
            <div class="explainer-item"><strong>20/15</strong><span>Better than average. You see at 20ft what some need 15ft to see. Common in young, well-nourished eyes.</span></div>
          </div>
        </div>

        <div class="ayur-result-card">
          <h3>ॐ Alochaka Pitta — Ayurvedic Eye Science</h3>
          <p>${
            overallRisk === 'low'
            ? 'Healthy vision reflects well-nourished Alochaka Pitta — the sub-dosha governing visual perception, residing in the photoreceptors of the retina. In Ayurveda, clear acuity depends on three pillars: strong Ojas (vital immunity), pure Rakta Dhatu (blood nourishment to the eye), and balanced Pitta. Maintain with Triphala eyewash (Netropanaha), daily Amla (richest natural Vitamin C for lens health), and regular Nasya (oil drops in nasal passages to nourish the brain-eye axis).'
            : overallRisk === 'moderate'
            ? 'Reduced acuity points to Alochaka Pitta imbalance — most commonly from excess screen time (digital Pitta aggravation), nutritional deficiencies (Vitamin A, Omega-3, Lutein), accumulated Ama (metabolic toxins impairing microvascular circulation to the retina), and chronic stress. The classical treatment is Netra Tarpana — the eyes are immersed in warm, medicated ghee for 10 minutes, profoundly nourishing the optic nerve. Saptamrita Lauh and Amalaki Rasayana are classical formulations for visual restoration.'
            : 'Significant visual impairment — please see an ophthalmologist. Ayurvedic care runs alongside modern medicine: Netra Tarpana (direct ocular nourishment), Nasya with Anu Taila (brain-eye axis support), Brahmi Ghrita (optic nerve nourishment), and Punarnava for intraocular pressure. These are supportive, not curative. Professional diagnosis is essential.'
          }</p>
        </div>

        <div class="result-suggestions">
          <h3>Evidence-Based Eye Health Recommendations</h3>
          <div class="sug-list">
            <div class="sug-item">
              <div class="sug-item-icon">🫧</div>
              <div class="sug-item-body">
                <strong>Triphala Eyewash (Netropanaha)</strong>
                <p>Boil 1 tsp of Triphala powder in 2 cups of water for 10 minutes. Cool fully and strain multiple times through fine cloth until completely clear. Wash eyes gently twice daily. The tannins in Haritaki reduce inflammation; Amla's Vitamin C strengthens retinal capillary walls; Bibhitaki has anti-infective properties. Clinical studies confirm Triphala eyewash reduces digital eye strain and conjunctivitis effectively.</p>
              </div>
            </div>
            <div class="sug-item">
              <div class="sug-item-icon">📱</div>
              <div class="sug-item-body">
                <strong>20-20-20 Rule — Non-Negotiable for Screen Users</strong>
                <p>Every 20 minutes of near work: look at a target at least 20 feet (6 metres) away for 20 seconds. This fully relaxes ciliary muscle tension — the dominant mechanism behind progressive myopia. Additionally, blink consciously every 4 seconds during screen use (most people blink only 3–5 times per minute while reading, vs 15–20 normally), causing severe aqueous tear film evaporation and corneal micro-abrasions.</p>
              </div>
            </div>
            <div class="sug-item">
              <div class="sug-item-icon">🥕</div>
              <div class="sug-item-body">
                <strong>Retina-Building Nutrition</strong>
                <p><strong>Lutein + Zeaxanthin</strong> (kale, spinach, egg yolks) — these accumulate in the macula and physically filter harmful blue light wavelengths. The AREDS2 clinical trial confirmed they slow macular degeneration by 25%. <strong>Vitamin A / Beta-carotene</strong> (sweet potato, carrots) — essential for rhodopsin synthesis in rod photoreceptors (night vision). <strong>Omega-3 DHA</strong> (flaxseed, walnuts, fatty fish) — structural constituent of photoreceptor membranes. <strong>Amla (Indian Gooseberry)</strong> — the richest natural source of Vitamin C; shown in Indian studies to slow nuclear cataracts.</p>
              </div>
            </div>
            ${overallRisk !== 'low' ? `
            <div class="sug-item">
              <div class="sug-item-icon">🏥</div>
              <div class="sug-item-body">
                <strong>See an Eye Specialist — Prioritise This</strong>
                <p>Your screening shows reduced acuity requiring professional evaluation. An optometrist can determine your exact refractive error (glasses prescription), measure intraocular pressure (glaucoma screening), and examine the retina (macular degeneration, diabetic retinopathy). Many vision problems — including myopia, hypermetropia, astigmatism, and early cataracts — are completely correctable with early intervention. In India: AIIMS, Sankara Nethralaya, LV Prasad Eye Institute, and Aravind Eye Hospital offer world-class, affordable eye care.</p>
              </div>
            </div>` : ''}
            <div class="sug-item">
              <div class="sug-item-icon">🌙</div>
              <div class="sug-item-body">
                <strong>Sleep, Darkness & Eye Repair</strong>
                <p>The eye undergoes critical repair during sleep — particularly during REM phases when aqueous humour is replenished and metabolic waste cleared from the vitreous. Chronic sleep deprivation is associated with increased intraocular pressure (glaucoma risk), reduced tear production (dry eye syndrome), and measurably impaired contrast sensitivity. Target 7–8 hours. Use blue-light-blocking glasses 2 hours before bed and ensure complete darkness during sleep — melatonin is essential for retinal circadian signalling.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="eye-disclaimer">
          <strong>⚠️ Important Disclaimer</strong>
          <p>This is a browser-based Snellen screening test. Accuracy depends on screen calibration accuracy and correct viewing distance. It is NOT equivalent to a clinical refraction test on a standardised 6-metre back-illuminated chart. <strong>This test cannot diagnose refractive errors, eye disease, or visual pathology.</strong> Always consult a qualified optometrist or ophthalmologist for diagnosis and prescription.</p>
        </div>

        <div class="result-cta">
          <h3>🙏 Ayurvedic Eye Care Consultation</h3>
          <p>Netra Tarpana, Nasya therapy, and Saptamrita Lauh can meaningfully support vision health alongside conventional optometry.</p>
          <div class="result-cta-btns">
            <a href="/consult" class="btn btn-primary">Book Eye Care Consultation ✦</a>
            <button class="btn btn-ghost" onclick="showHub()">← Back to Hub</button>
          </div>
        </div>
      </div>
    `;
    container.innerHTML = '';
    container.appendChild(el);
  }

  renderCalibration();
}

// ══════════════════════════════════════════════════════════════
// NEW TEST 1: MENTAL HEALTH & STRESS ASSESSMENT
// PHQ-9 inspired + Ayurvedic Manas Prakriti mapping
// ══════════════════════════════════════════════════════════════
function renderMentalHealthTest(container) {
  const questions = [
    { text: 'Over the past 2 weeks, how often have you felt little interest or pleasure in doing things?', sub: 'Core anhedonia indicator (PHQ-9)', options: [
      { label: 'Not at all', score: 0 },
      { label: 'Several days', score: 1 },
      { label: 'More than half the days', score: 2 },
      { label: 'Nearly every day', score: 3 },
    ]},
    { text: 'How often have you felt down, depressed, hopeless, or empty?', options: [
      { label: 'Not at all', score: 0 },
      { label: 'Several days', score: 1 },
      { label: 'More than half the days', score: 2 },
      { label: 'Nearly every day', score: 3 },
    ]},
    { text: 'How would you describe your anxiety and worry levels?', options: [
      { label: 'Calm — rarely anxious', score: 0 },
      { label: 'Mild anxiety — manageable', score: 1 },
      { label: 'Moderate — affects daily decisions', score: 2 },
      { label: 'Severe — constant worry, hard to control', score: 3 },
    ]},
    { text: 'How is your sleep in relation to your mental state?', options: [
      { label: 'Good — restful and sufficient', score: 0 },
      { label: 'Slight difficulty — occasional insomnia', score: 1 },
      { label: 'Poor — unable to sleep or sleeping too much', score: 2 },
      { label: 'Severely disrupted — racing mind at night', score: 3 },
    ]},
    { text: 'How is your concentration and ability to focus?', options: [
      { label: 'Sharp — focused and present', score: 0 },
      { label: 'Mild difficulty — occasional lapses', score: 1 },
      { label: 'Noticeable brain fog, hard to complete tasks', score: 2 },
      { label: 'Cannot focus at all — reading or working is impossible', score: 3 },
    ]},
    { text: 'How often do you feel overwhelmed by stress?', options: [
      { label: 'Rarely — stress is manageable', score: 0 },
      { label: 'Sometimes — work or personal stress spikes', score: 1 },
      { label: 'Often — feel like I cannot cope', score: 2 },
      { label: 'Almost daily — complete overwhelm', score: 3 },
    ]},
    { text: 'Have you experienced unexplained physical symptoms (headaches, tight chest, stomach upset) linked to stress?', options: [
      { label: 'No physical stress symptoms', score: 0 },
      { label: 'Occasional tension headaches', score: 1 },
      { label: 'Regular — stomach upset, palpitations, or jaw tension', score: 2 },
      { label: 'Frequent — multiple stress-linked physical symptoms', score: 3 },
    ]},
    { text: 'How is your relationship with food and appetite?', options: [
      { label: 'Normal — regular appetite and eating pattern', score: 0 },
      { label: 'Slightly reduced or increased appetite', score: 1 },
      { label: 'Stress eating or loss of interest in food', score: 2 },
      { label: 'Significant change — emotional eating, bingeing or skipping meals', score: 3 },
    ]},
    { text: 'Do you feel disconnected from yourself, others, or life in general?', options: [
      { label: 'No — feel connected and purposeful', score: 0 },
      { label: 'Occasionally withdrawn or disengaged', score: 1 },
      { label: 'Often — feel emotionally numb or isolated', score: 2 },
      { label: 'Severe disconnection — feel like nothing matters', score: 3 },
    ]},
    { text: 'How would you rate your overall emotional resilience?', options: [
      { label: 'Strong — bounce back from setbacks quickly', score: 0 },
      { label: 'Moderate — takes time but I recover', score: 1 },
      { label: 'Low — setbacks hit hard and linger', score: 2 },
      { label: 'Very low — small things feel catastrophic', score: 3 },
    ]},
  ];

  function scoreTest(answers) {
    let total = 0;
    answers.forEach((a, i) => { if (a !== null) total += questions[i].options[a].score; });
    return total;
  }

  function onComplete(answers, score) {
    const maxScore = 30;
    let category, risk, ayurType;
    if (score <= 4)       { category = 'Minimal Stress — Excellent Resilience'; risk = 'low'; ayurType = 'Sattvic Mind (Sattva Guna Dominant)'; }
    else if (score <= 9)  { category = 'Mild Stress — Monitor & Support'; risk = 'low'; ayurType = 'Mild Rajas — Needs Grounding'; }
    else if (score <= 14) { category = 'Moderate Stress — Intervention Recommended'; risk = 'moderate'; ayurType = 'Rajas-Tamas Imbalance'; }
    else if (score <= 19) { category = 'Moderately Severe — Professional Support Advised'; risk = 'high'; ayurType = 'Tamas Dominant — Mano Vaha Srotas Imbalance'; }
    else                  { category = 'Severe — Please Seek Help Today'; risk = 'high'; ayurType = 'Unmada (Psycho-emotional) Vikruti'; }

    renderResult(container, {
      icon: '🧠', title: 'Mental Health & Stress',
      score, maxScore, category, riskLevel: risk,
      breakdown: [
        { icon: '😔', label: 'Depression Indicators', value: (answers[0] ?? 0) + (answers[1] ?? 0) + (answers[8] ?? 0) <= 2 ? 'Minimal' : (answers[0] ?? 0) + (answers[1] ?? 0) + (answers[8] ?? 0) <= 5 ? 'Mild' : 'Elevated', sub: 'PHQ-9 mapped items' },
        { icon: '😰', label: 'Anxiety Level', value: (answers[2] ?? 0) + (answers[5] ?? 0) >= 4 ? 'High' : (answers[2] ?? 0) + (answers[5] ?? 0) >= 2 ? 'Moderate' : 'Low', sub: 'GAD-mapped pattern' },
        { icon: '🌀', label: 'Manas Dosha', value: ayurType.split('—')[0].trim(), sub: 'Ayurvedic mental pattern' },
      ],
      ayurvedic: score <= 4
        ? 'Sattva mind — the highest Gunas are dominant. Continue Satvic practices: early rising, meditation, Sattvic diet (clean, fresh, lightly spiced food), and regular Swadhyaya (self-study). The mind is an instrument of liberation when Sattva prevails.'
        : score <= 14
        ? `Rajasic imbalance detected — ${ayurType}. Ayurveda sees mental health through the Mano Vaha Srotas (mind channels). Brahmi (Bacopa monnieri) is the premier Medhya Rasayana — clinical studies show 20% cortisol reduction. Ashwagandha (KSM-66 extract) reduces anxiety by up to 44% in double-blind trials. Shankhapushpi improves delta-wave sleep, directly addressing anxiety-related insomnia. Shirodhara (warm oil flow on forehead) has documented anxiolytic effects comparable to lorazepam in clinical literature.`
        : `Tamas-Rajas mind pattern with significant Mano Roga indicators. Ayurveda's classical approach to Unmada (emotional-mental disorders): Brahmi Ghrita internally, Nasya therapy with Shatavari oil (clears Mano Vaha Srotas), Medhya Rasayanas (Brahmi, Mandukparni, Jyotishmati, Shankhapushpi), and Yoga Nidra for deep neurological reset. Alongside professional mental health support, these therapies create powerful synergy.`,
      suggestions: [
        { icon: '🧘', title: 'Yoga Nidra & Meditation', text: 'Yoga Nidra (1 session = 4 hours of sleep neurologically) specifically targets the limbic system and amygdala hyperactivation that drives anxiety and depression. Start with a 20-minute guided session daily. Combined with Trataka (candle meditation), this creates measurable neuroplastic change within 8 weeks.' },
        { icon: '🌿', title: 'Medhya Rasayanas — Brain Herbs', text: 'Brahmi (Bacopa): 300mg/day — 20% cortisol reduction in RCTs. Ashwagandha (KSM-66): 300–600mg/day — 44% anxiety reduction. Shankhapushpi: supports GABA pathways. Jatamansi: natural sedative. Combine as Saraswataristha (classical formulation). Always use standardised extracts from verified sources.' },
        { icon: '🌅', title: 'Sattvic Morning Ritual', text: 'The first 60 minutes of the day program your nervous system for the entire day. Wake before sunrise. Copper water (negatively charged ions). Sesame oil pulling (reduces cortisol via vagal nerve stimulation). Surya Namaskar (12 rounds — raises endorphins, BDNF, serotonin). 10-minute meditation. No phone until after breakfast.' },
        ...(score >= 15 ? [{ icon: '🏥', title: '⚡ Please Talk to Someone Today', text: 'Your score indicates significant distress. Please reach out: iCall (9152987821), Vandrevala Foundation (1860-2662-345) — 24/7, free, confidential. A professional mental health consultation is strongly recommended alongside any Ayurvedic support. You deserve to feel well.' }] : [{ icon: '😴', title: 'Sleep as Medicine', text: 'Sleep is the brain\'s detox cycle — glymphatic clearance removes metabolic waste including beta-amyloid and cortisol metabolites. Target 10pm–6am (Ayurvedic sleep window). Abhyanga on feet with sesame oil, warm ashwagandha milk, and digital sunset at 9pm create measurable sleep quality improvement within 2 weeks.' }]),
      ],
    });
  }

  container.appendChild(buildQuizTest({ icon: '🧠', title: 'Mental Health & Stress Assessment', subtitle: '10 questions · PHQ-9 inspired · Ayurvedic Manas mapping · 5 minutes', questions, scoreTest, onComplete }));
}

// ══════════════════════════════════════════════════════════════
// NEW TEST 2: GUT HEALTH & IBS ASSESSMENT
// Rome IV Criteria + Grahani Roga (Ayurvedic GI disorders)
// ══════════════════════════════════════════════════════════════
function renderGutHealthTest(container) {
  const questions = [
    { text: 'How often do you experience abdominal pain or cramping?', sub: 'Core Rome IV IBS criterion', options: [
      { label: 'Rarely or never', score: 0 },
      { label: 'Less than once a week', score: 1 },
      { label: '1–2 times per week', score: 2 },
      { label: '3+ times per week — significantly impacts life', score: 4 },
    ]},
    { text: 'Does your abdominal pain improve after a bowel movement?', options: [
      { label: 'No pain or pain is unrelated to bowel movements', score: 0 },
      { label: 'Sometimes — mild relief', score: 1 },
      { label: 'Usually — pain clearly linked to bowel habits', score: 2 },
      { label: 'Always — bowel-pain connection is my main symptom', score: 3 },
    ]},
    { text: 'How would you describe your stool consistency (Bristol Stool Scale)?', sub: 'Type 1–2 = Constipated, Type 3–4 = Normal, Type 5–7 = Loose', options: [
      { label: 'Normal — well-formed, easy to pass (Type 3–4)', score: 0 },
      { label: 'Hard, lumpy, pellet-like — constipated (Type 1–2)', score: 2 },
      { label: 'Soft, mushy, partially formed (Type 5–6)', score: 2 },
      { label: 'Watery, liquid, or urgency-driven (Type 7)', score: 3 },
      { label: 'Alternating — sometimes constipated, sometimes loose', score: 4 },
    ]},
    { text: 'How frequently do you experience bloating and gas?', options: [
      { label: 'Rarely — only with unusual foods', score: 0 },
      { label: 'Occasionally — several times a month', score: 1 },
      { label: 'Frequently — several times a week', score: 2 },
      { label: 'Daily — bloating is a constant companion', score: 4 },
    ]},
    { text: 'Do you have any of these symptoms?', sub: 'Select the one that best applies', options: [
      { label: 'None of the below', score: 0 },
      { label: 'Heartburn or acid reflux regularly', score: 2 },
      { label: 'Nausea after meals or in the morning', score: 2 },
      { label: 'Visible mucus in stools', score: 3 },
      { label: 'Blood in stools (please see a doctor immediately)', score: 5 },
    ]},
    { text: 'Do certain foods consistently worsen your gut symptoms?', options: [
      { label: 'No specific food triggers', score: 0 },
      { label: 'Yes — dairy and wheat/gluten upset me', score: 2 },
      { label: 'Yes — onions, garlic, beans, or high-FODMAP foods', score: 2 },
      { label: 'Yes — spicy, oily, or processed foods', score: 1 },
      { label: 'Yes — multiple categories trigger symptoms', score: 3 },
    ]},
    { text: 'Does stress or anxiety worsen your gut symptoms?', sub: 'Gut-brain axis assessment', options: [
      { label: 'No clear connection', score: 0 },
      { label: 'Mild — some correlation noticed', score: 1 },
      { label: 'Moderate — stress clearly worsens symptoms', score: 2 },
      { label: 'Strong — gut is my primary stress barometer', score: 3 },
    ]},
    { text: 'How would you describe your appetite and relationship with food?', options: [
      { label: 'Healthy — enjoy meals, regular appetite', score: 0 },
      { label: 'Cautious — restrict certain foods due to symptoms', score: 1 },
      { label: 'Anxious — fear of eating due to pain or urgency', score: 2 },
      { label: 'Severely restricted — cannot eat normally', score: 3 },
    ]},
    { text: 'Do you experience urgency — sudden need to rush to the bathroom?', options: [
      { label: 'No urgency — can wait normally', score: 0 },
      { label: 'Occasional urgency', score: 1 },
      { label: 'Frequent urgency, sometimes cannot hold it', score: 3 },
    ]},
    { text: 'How long have these gut issues been present?', options: [
      { label: 'Less than 3 months or occasional episodes', score: 0 },
      { label: '3–6 months — intermittent symptoms', score: 1 },
      { label: '6–12 months — becoming more regular', score: 2 },
      { label: 'More than 1 year — chronic ongoing issue', score: 3 },
    ]},
  ];

  function scoreTest(answers) {
    let total = 0;
    answers.forEach((a, i) => { if (a !== null) total += questions[i].options[a].score; });
    return total;
  }

  function onComplete(answers, score) {
    const maxScore = 34;
    let category, risk;
    const bloodInStool = answers[4] === 4;
    if (bloodInStool) {
      category = '⚠️ Blood in Stool — See Doctor Immediately'; risk = 'high';
    } else if (score <= 4)  { category = 'Healthy Gut — Low Risk'; risk = 'low'; }
    else if (score <= 10)   { category = 'Mild Gut Sensitivity — Monitor'; risk = 'low'; }
    else if (score <= 18)   { category = 'Moderate IBS-Pattern — Intervention Useful'; risk = 'moderate'; }
    else                    { category = 'Significant GI Disorder — Specialist Advised'; risk = 'high'; }

    const stressLink = (answers[6] ?? 0) >= 2;
    const ibsType = (answers[2] ?? 0) === 1 ? 'IBS-C (Constipation-dominant)' : (answers[2] ?? 0) === 3 ? 'IBS-D (Diarrhoea-dominant)' : (answers[2] ?? 0) === 4 ? 'IBS-M (Mixed)' : 'Functional Gut Disorder';

    renderResult(container, {
      icon: '🫃', title: 'Gut Health & IBS Screener',
      score, maxScore, category, riskLevel: risk,
      breakdown: [
        { icon: '🔄', label: 'IBS Pattern', value: ibsType.split('(')[0].trim(), sub: ibsType },
        { icon: '🧠', label: 'Gut-Brain Link', value: stressLink ? 'Significant' : 'Minimal', sub: 'Stress-gut correlation' },
        { icon: '🔥', label: 'Agni Status', value: score <= 4 ? 'Sama (Balanced)' : score <= 10 ? 'Vishama (Variable)' : score <= 18 ? 'Manda (Sluggish)' : 'Tikshna (Irritated)', sub: 'Ayurvedic digestive fire' },
      ],
      ayurvedic: score <= 4
        ? 'Balanced Agni and healthy Grahani (gut). In Ayurveda, the gut is the second brain — your Annavaha Srotas (GI channel) is functioning well. Maintain with Triphala nightly, Agni-kindling spices (cumin, coriander, fennel — CCF tea), and mindful Mitahara (moderate eating).'
        : score <= 10
        ? 'Mild Grahani Roga (functional gut disorder). Ayurveda recognises that all disease begins in the gut — even minor imbalances signal early Ama formation. Panchakola (5-spice heating formula), Chitrakadi Vati (Agni stimulant), and Bilva fruit (Aegle marmelos — strongest classical Grahani herb) are first-line interventions. Avoid Viruddha Ahara (food combining that creates fermentation: milk + meat, fruit + dairy).'
        : `Significant Grahani Roga with ${ibsType} pattern. Classical Ayurvedic treatment: Kutajarishta (Holarrhena antidysenterica — specific for diarrhoea-predominant IBS), or Gandharvahasthadi Kashayam (for constipation). Basti (medicated enema) is the most powerful treatment for chronic Grahani — it directly nourishes and heals the colon mucosa. Takra (medicated buttermilk with cumin, rock salt, and dried ginger) is the traditional daily medicine for IBS in both forms.`,
      suggestions: [
        { icon: '🍵', title: 'CCF Tea — Daily Gut Medicine', text: 'Cumin (Jeeraka) + Coriander (Dhanyaka) + Fennel (Shatapushpa) — the three seeds of Ayurvedic gut healing. Boil 1 tsp each in 500ml water for 5 minutes. Sip through the day. This tridoshic formula reduces gas, bloating, and IBS symptoms, regulates bowel movement, and kindly kindles Agni without aggravating any dosha.' },
        { icon: '🌿', title: 'Grahani Herbs', text: answers[2] === 1 ? 'IBS-C protocol: Triphala (1 tsp at night), Psyllium husk (Isabgol) with warm water morning and night, Haritaki (bowel lubricant), and castor oil (Eranda) 1 tsp at bedtime in severe cases.' : answers[2] === 3 ? 'IBS-D protocol: Kutaja (Holarrhena) bark extract, Bilva (Aegle marmelos) fruit rind, Takra (spiced buttermilk), Nagarmotha (Cyperus rotundus) — specific for loose stools in Ayurveda. Avoid cold water and raw food.' : 'Tridoshic gut protocol: Triphala + Bilva + Chitrak + Takra with spiced buttermilk daily.' },
        { icon: '🧠', title: stressLink ? 'Gut-Brain Axis — Your Primary Target' : 'Low-FODMAP Starter', text: stressLink ? 'Your stress-gut connection is significant. The vagus nerve directly connects the brain and gut — Vagus Nerve Stimulation through humming, cold water face splashing, and slow diaphragmatic breathing (4-7-8 pattern) has immediate calming effects on the enteric nervous system. Brahmi + Mandukparni address both the mental and GI manifestations of stress.' : 'Reducing high-FODMAP foods (onion, garlic, apple, wheat, dairy) for 6 weeks followed by systematic reintroduction identifies your personal triggers. This is the most evidence-based IBS dietary intervention available.' },
        { icon: '🦠', title: 'Probiotic Foods (Ayurvedic)', text: 'Takra (spiced buttermilk): the classical Ayurvedic probiotic. Fresh curd (not stored overnight) with a pinch of rock salt. Kanji (fermented carrot water) in spring. These traditional foods colonise the gut with beneficial lactobacilli while simultaneously healing the mucosal lining — unlike commercial probiotics that do not survive the stomach acid.' },
      ],
    });
  }

  container.appendChild(buildQuizTest({ icon: '🫃', title: 'Gut Health & IBS Screener', subtitle: '10 questions · Rome IV criteria · Grahani Roga analysis · 5 minutes', questions, scoreTest, onComplete }));
}

// ══════════════════════════════════════════════════════════════
// NEW TEST 3: JOINT HEALTH & ARTHRITIS RISK
// Aamavata + Osteoarthritis + Uric Acid Screener
// ══════════════════════════════════════════════════════════════
function renderJointHealthTest(container) {
  const questions = [
    { text: 'Where do you primarily experience joint pain or stiffness?', sub: 'Select your most affected area', options: [
      { label: 'No joint pain or stiffness', score: { oa: 0, aa: 0, gout: 0 } },
      { label: 'Knees and/or hips — weight-bearing joints', score: { oa: 4, aa: 1, gout: 0 } },
      { label: 'Fingers, wrists, and small joints — symmetrically', score: { oa: 0, aa: 4, gout: 0 } },
      { label: 'Big toe, ankle, or foot — sudden severe pain', score: { oa: 0, aa: 0, gout: 4 } },
      { label: 'Multiple joints — widespread', score: { oa: 2, aa: 3, gout: 1 } },
    ]},
    { text: 'When is your joint pain worst?', options: [
      { label: 'No pain at any time', score: { oa: 0, aa: 0, gout: 0 } },
      { label: 'After activity or prolonged use', score: { oa: 3, aa: 0, gout: 1 } },
      { label: 'Morning stiffness lasting more than 1 hour', score: { oa: 1, aa: 4, gout: 0 } },
      { label: 'At night — wakes me from sleep', score: { oa: 1, aa: 2, gout: 3 } },
      { label: 'Constant — no clear pattern', score: { oa: 2, aa: 2, gout: 2 } },
    ]},
    { text: 'Do you notice swelling, redness or warmth in your joints?', options: [
      { label: 'No swelling or redness', score: { oa: 0, aa: 0, gout: 0 } },
      { label: 'Mild puffiness occasionally', score: { oa: 1, aa: 2, gout: 1 } },
      { label: 'Visible swelling, red and warm to touch', score: { oa: 1, aa: 3, gout: 4 } },
      { label: 'Hard bony swelling (Heberden\'s nodes on fingers)', score: { oa: 4, aa: 1, gout: 0 } },
    ]},
    { text: 'What is your age and BMI situation?', options: [
      { label: 'Under 40, healthy weight', score: { oa: 0, aa: 0, gout: 0 } },
      { label: '40–60, normal or slightly overweight', score: { oa: 2, aa: 0, gout: 1 } },
      { label: '40+, overweight or obese', score: { oa: 4, aa: 1, gout: 2 } },
      { label: 'Any age with sudden joint attacks', score: { oa: 0, aa: 2, gout: 3 } },
    ]},
    { text: 'What is your diet like?', sub: 'Dietary factors strongly influence joint health', options: [
      { label: 'Plant-based, balanced, minimal processed food', score: { oa: 0, aa: 0, gout: 0 } },
      { label: 'Regular red meat and seafood consumption', score: { oa: 1, aa: 0, gout: 3 } },
      { label: 'High processed/refined food, sugar, or fried food', score: { oa: 2, aa: 2, gout: 2 } },
      { label: 'Irregular eating, cold/stale food often', score: { oa: 2, aa: 3, gout: 1 } },
    ]},
    { text: 'Do your joints make sounds (cracking, grinding, clicking)?', options: [
      { label: 'Rarely', score: { oa: 0, aa: 0, gout: 0 } },
      { label: 'Occasional clicking, no pain', score: { oa: 1, aa: 0, gout: 0 } },
      { label: 'Grinding sound with movement (crepitus)', score: { oa: 3, aa: 1, gout: 0 } },
      { label: 'Loud cracking with or without pain', score: { oa: 2, aa: 1, gout: 0 } },
    ]},
    { text: 'Do you have family history of arthritis or joint problems?', options: [
      { label: 'No family history', score: { oa: 0, aa: 0, gout: 0 } },
      { label: 'One parent with arthritis or joint replacement', score: { oa: 2, aa: 1, gout: 1 } },
      { label: 'Multiple family members — rheumatic disease', score: { oa: 2, aa: 3, gout: 2 } },
    ]},
    { text: 'How does cold or damp weather affect your joints?', options: [
      { label: 'No effect', score: { oa: 0, aa: 0, gout: 0 } },
      { label: 'Mild stiffness in cold weather', score: { oa: 1, aa: 1, gout: 0 } },
      { label: 'Significant worsening in cold/rainy weather', score: { oa: 2, aa: 3, gout: 1 } },
      { label: 'Joints are weather-sensitive — I can predict rain', score: { oa: 3, aa: 3, gout: 2 } },
    ]},
  ];

  function scoreTest(answers) {
    let oa = 0, aa = 0, gout = 0;
    answers.forEach((a, i) => {
      if (a !== null) {
        oa   += questions[i].options[a].score.oa;
        aa   += questions[i].options[a].score.aa;
        gout += questions[i].options[a].score.gout;
      }
    });
    const total = oa + aa + gout;
    const type = oa >= aa && oa >= gout ? 'Osteoarthritis (Sandhivata)' : aa >= gout ? 'Rheumatoid-Pattern (Aamavata)' : 'Gout-Pattern (Vatarakta)';
    return { oa, aa, gout, total, type };
  }

  function onComplete(answers, s) {
    const { oa, aa, gout, total, type } = s;
    const maxScore = 32;
    const risk = total <= 4 ? 'low' : total <= 12 ? 'moderate' : 'high';
    const category = total <= 4 ? 'Healthy Joints — Low Risk' : `${type} Pattern Detected`;

    renderResult(container, {
      icon: '🦴', title: 'Joint Health & Arthritis',
      score: total, maxScore, category, riskLevel: risk,
      breakdown: [
        { icon: '🦵', label: 'Osteoarthritis Risk', value: oa, sub: 'Sandhivata indicators' },
        { icon: '🔴', label: 'Rheumatoid Risk', value: aa, sub: 'Aamavata indicators' },
        { icon: '⚡', label: 'Gout Risk', value: gout, sub: 'Vatarakta indicators' },
      ],
      ayurvedic: total <= 4
        ? 'Healthy Sandhi (joint) function. In Ayurveda, strong joints reflect good Asthi Dhatu (bone tissue) and sufficient Sleshaka Kapha (synovial fluid). Maintain with Shatavari + Ashwagandha (Rasayana for joint tissue), adequate ghee in diet, and Abhyanga (joint lubrication through oil massage).'
        : type.includes('Sandhivata')
        ? 'Sandhivata (Osteoarthritis) pattern. Vata derangement dries the Sleshaka Kapha (joint fluid) — like oil drying in a hinge. Classical treatment: Mahanarayana Taila (Janu Basti — warm oil retention on knee joint), Dashamoola Kashayam, Shallaki (Boswellia serrata — 250mg/day reduces OA pain comparably to NSAIDs in clinical trials), and Rasnasaptaka Kashayam internally.'
        : type.includes('Aamavata')
        ? 'Aamavata (Rheumatoid-pattern) — a combination of Ama (toxins) and Vata in the joints. Considered one of the most difficult conditions in Ayurveda. Classical treatment: Simhanada Guggulu (anti-Ama anti-Vata), Rasna + Devadaru decoction, Virechana (purgation to clear Ama), and strict Ama-reducing diet (no curd, fish, incompatible food, or daytime sleep).'
        : 'Vatarakta (Gout) — excess uric acid combined with Vata and Rakta (blood) aggravation. Classical treatment: Kaishora Guggulu (blood purifier), Guduchi (Giloy) — reduces uric acid, Cherry/amla for uricosuric effect, and complete elimination of high-purine foods (red meat, organ meat, alcohol, shellfish).',
      suggestions: [
        { icon: '🫙', title: 'Janu Basti — Joint Oil Therapy', text: 'The most powerful Ayurvedic joint treatment — warm Mahanarayana Taila is retained in a dough dam on the affected joint for 30–45 minutes. The lipophilic oil penetrates the joint capsule, rehydrates synovial fluid, and directly nourishes cartilage. 7–14 sessions show clinical improvement in OA equivalent to 6 weeks of physiotherapy.' },
        { icon: '🌿', title: 'Evidence-Based Joint Herbs', text: 'Boswellia serrata (Shallaki): 250mg AKBA extract — clinical trials show 50–70% pain reduction in 8 weeks. Ashwagandha: anti-inflammatory equal to hydrocortisone without side effects. Curcumin (Haridra): 500mg + 20mg piperine — reduces CRP, IL-6, and TNF-alpha. Nirgundi (Vitex negundo): local anti-inflammatory paste for acute flares.' },
        { icon: '🏊', title: 'Exercise in Water', text: 'Hydrotherapy and swimming are the ideal exercises for joint conditions — water buoyancy reduces weight-bearing by 60–90%, allowing full range of motion without stress. Aqua walking, gentle backstroke, and pool Yoga are classical Ayurvedic water therapies (Jala therapy) modernised. 3x/week reduces joint pain by 35% in 6 weeks.' },
        { icon: '🍽️', title: type.includes('Aamavata') ? 'Ama-Reducing Diet' : 'Joint-Protective Diet', text: type.includes('Aamavata') ? 'Strict Ama diet: no curd (yoghurt), no fish, no heavy/cold/hard-to-digest food, no food combinations that create fermentation (milk + fruit, rice + fish). Eat only warm, freshly cooked, easily digestible food. Fasting one day per week on warm ginger water speeds Ama clearance.' : 'Anti-inflammatory diet: Omega-3 rich foods (walnuts, flax), turmeric in every meal with black pepper, ginger tea twice daily. Reduce nightshade vegetables (tomato, potato, brinjal) if joints are inflammatory — they contain solanine which aggravates Vata-Pitta joint conditions.' },
      ],
    });
  }

  container.appendChild(buildQuizTest({ icon: '🦴', title: 'Joint Health & Arthritis Risk', subtitle: '8 questions · OA · Rheumatoid · Gout patterns · Ayurvedic mapping', questions, scoreTest, onComplete }));
}

// ══════════════════════════════════════════════════════════════
// NEW TEST 4: SLEEP QUALITY ASSESSMENT
// PSQI-inspired + Nidra (Sleep) Ayurvedic analysis
// ══════════════════════════════════════════════════════════════
function renderSleepQualityTest(container) {
  const questions = [
    { text: 'How long does it typically take you to fall asleep?', sub: 'Sleep onset latency — a core sleep quality marker', options: [
      { label: '≤15 minutes — I fall asleep easily', score: 0 },
      { label: '16–30 minutes', score: 1 },
      { label: '31–60 minutes — takes a while to settle', score: 2 },
      { label: 'More than 60 minutes — brain won\'t stop', score: 3 },
    ]},
    { text: 'How many hours of actual sleep do you get per night (not time in bed)?', options: [
      { label: '7–9 hours — optimal', score: 0 },
      { label: '6–7 hours — slightly short', score: 1 },
      { label: '5–6 hours — chronically under-recovered', score: 2 },
      { label: 'Less than 5 hours', score: 3 },
    ]},
    { text: 'How often do you wake during the night?', options: [
      { label: 'Rarely — sleep through mostly', score: 0 },
      { label: 'Once — fall back to sleep easily', score: 1 },
      { label: '2–3 times — sometimes hard to return to sleep', score: 2 },
      { label: 'Multiple times — sleep is fragmented', score: 3 },
    ]},
    { text: 'How do you feel upon waking in the morning?', options: [
      { label: 'Refreshed and energetic — ready to start the day', score: 0 },
      { label: 'Reasonably rested — need 5–10 minutes', score: 1 },
      { label: 'Groggy and heavy — takes 30+ min to feel awake', score: 2 },
      { label: 'Exhausted — feel worse than before sleeping', score: 3 },
    ]},
    { text: 'Do you have an irregular sleep schedule — different bedtime or wake time each day?', options: [
      { label: 'Very consistent — ±30 minutes every day', score: 0 },
      { label: 'Mostly consistent — varies by 1 hour', score: 1 },
      { label: 'Irregular — varies significantly on weekends', score: 2 },
      { label: 'Very irregular — shift work, no fixed schedule', score: 3 },
    ]},
    { text: 'Do you snore loudly, stop breathing, or gasp in your sleep?', sub: 'Sleep apnoea screening', options: [
      { label: 'No — confirmed by partner or self', score: 0 },
      { label: 'Mild snoring occasionally', score: 1 },
      { label: 'Regular loud snoring', score: 2 },
      { label: 'Gasping, choking, or breathing pauses during sleep', score: 4 },
    ]},
    { text: 'Do you use screens (phone, TV, laptop) in the hour before sleep?', options: [
      { label: 'Rarely — digital sunset practice active', score: 0 },
      { label: 'Sometimes — occasional night scrolling', score: 1 },
      { label: 'Usually — phone is my bedtime routine', score: 2 },
      { label: 'Always — screen use right until sleeping', score: 3 },
    ]},
    { text: 'How often do you feel sleepy during the day despite a full night\'s sleep?', options: [
      { label: 'Rarely — alert and awake through the day', score: 0 },
      { label: 'Occasional afternoon dip — normal', score: 1 },
      { label: 'Often — doze off in meetings, post-lunch fatigue is heavy', score: 2 },
      { label: 'Daily — fighting sleep constantly', score: 3 },
    ]},
  ];

  function scoreTest(answers) {
    let total = 0;
    answers.forEach((a, i) => { if (a !== null) total += questions[i].options[a].score; });
    return total;
  }

  function onComplete(answers, score) {
    const maxScore = 24;
    let category, risk, nidraType;
    if (score <= 4)       { category = 'Good Sleep Quality'; risk = 'low'; nidraType = 'Sukha Nidra (Restful Sleep)'; }
    else if (score <= 9)  { category = 'Mild Sleep Issues — Easily Correctable'; risk = 'low'; nidraType = 'Vata-Disturbed Nidra'; }
    else if (score <= 14) { category = 'Moderate Sleep Disorder — Intervention Needed'; risk = 'moderate'; nidraType = 'Ati-Jagarana (Chronic Sleeplessness)'; }
    else                  { category = 'Severe Sleep Disorder — Medical Evaluation Required'; risk = 'high'; nidraType = 'Nidranasha (Sleep Disorder)'; }

    const apnoeaRisk = (answers[5] ?? 0) >= 2;

    renderResult(container, {
      icon: '🌙', title: 'Sleep Quality Assessment',
      score, maxScore, category, riskLevel: risk,
      breakdown: [
        { icon: '⏱️', label: 'Sleep Latency', value: ['≤15 min','16–30 min','31–60 min','>60 min'][answers[0] ?? 0], sub: 'Time to fall asleep' },
        { icon: '💤', label: 'Sleep Duration', value: ['7–9h','6–7h','5–6h','<5h'][answers[1] ?? 0], sub: 'Nightly sleep hours' },
        { icon: '🩺', label: 'Apnoea Risk', value: apnoeaRisk ? 'Present — Evaluate' : 'Low', sub: nidraType },
      ],
      ayurvedic: score <= 4
        ? `Excellent Nidra (sleep) — Ayurveda calls sound sleep one of the three pillars of life (Trayopastambha). Your Tarpaka Kapha (brain-nourishing Kapha) is balanced. Continue sleeping before 10 PM and waking at brahma muhurta (1.5 hours before sunrise) for optimal neurological repair.`
        : score <= 9
        ? `Vata-disturbed Nidra — the most common sleep imbalance. Racing thoughts, light sleep, and early waking are all Vata in the nervous system (Prana Vata + Tarpaka Kapha imbalance). Ayurvedic protocol: Abhyanga (sesame oil self-massage before bed), warm Ashwagandha milk (Ksheerpaka method), Brahmi + Jatamansi (natural GABA modulation), and Padabhyanga (foot oil massage — calms Prana Vata within 20 minutes).`
        : `${nidraType} — significant sleep disorder. Classical Ayurveda's most powerful sleep treatment is Shirodhara: continuous warm oil flow on the third eye triggers immediate parasympathetic response, measurably reducing cortisol and increasing delta-wave sleep. Medhya Rasayanas (Brahmi, Shankhapushpi) reset the sleep-wake cycle within 2–4 weeks. Chandanasava or Saraswatarishta at night support neurological recovery.`,
      suggestions: [
        { icon: '🕙', title: 'Ayurvedic Sleep Architecture', text: 'Ayurveda prescribes sleeping before 10 PM (Pitta time begins — Pitta\'s heat keeps you awake). Wake at Brahma Muhurta (90 minutes before sunrise — approximately 4:30–5:30 AM). This timing synchronises your circadian clock with solar rhythm, the most powerful sleep regulation mechanism available. Consistency is more important than duration.' },
        { icon: '🌿', title: 'Sleep-Supporting Herbs', text: 'Ashwagandha (KSM-66): reduces cortisol by 28%, improves sleep quality by 72% in RCTs. Brahmi: increases GABA and serotonin, supporting delta-wave sleep. Shankhapushpi: calms an overactive mind within 30 minutes. Jatamansi (Nardostachys): Ayurvedic equivalent of valerian, with stronger efficacy and no morning grogginess. Take as Ksheerpaka (milk decoction) 30 minutes before bed.' },
        ...(apnoeaRisk ? [{ icon: '⚠️', title: 'Sleep Apnoea Alert', text: 'Your responses indicate possible sleep apnoea — a serious condition where repeated micro-awakenings prevent restorative sleep and increase heart disease, diabetes, and stroke risk. Please request a sleep study (polysomnography) or home sleep test. A CPAP machine and/or weight reduction are highly effective. Simhanada Guggulu + Nasya therapy in Ayurveda support respiratory and sleep health.' }] : [{ icon: '📵', title: 'Digital Sunset Protocol', text: 'Blue light from screens suppresses melatonin by 50% for up to 3 hours. Create a Digital Sunset: no screens 1 hour before bed. Replace with: oil lamp reading (warm light spectrum), gentle pranayama (Chandra Bhedana — left-nostril breathing activates the parasympathetic nervous system), or light Yoga Nidra. This single change improves sleep onset by 30%.' }]),
        { icon: '🛁', title: 'Pre-Sleep Ritucharya', text: 'The most scientifically validated sleep hygiene practice: warm bath or foot soak (drops core body temperature post-bath — the main sleep trigger), followed by Padabhyanga (sesame oil foot massage — calms Vata within 20 minutes), Ashwagandha milk, and darkness. The pineal gland requires complete darkness to produce melatonin — even a digital clock\'s light can reduce melatonin by 15%.' },
      ],
    });
  }

  container.appendChild(buildQuizTest({ icon: '🌙', title: 'Sleep Quality Assessment', subtitle: '8 questions · PSQI-inspired · Nidra Ayurvedic analysis · 4 minutes', questions, scoreTest, onComplete }));
}

// ══════════════════════════════════════════════════════════════
// NEW TEST 5: ENERGY & FATIGUE ASSESSMENT
// Chronic Fatigue + Post-COVID Fatigue + Ojas Depletion
// ══════════════════════════════════════════════════════════════
function renderEnergyFatigueTest(container) {
  const questions = [
    { text: 'How would you describe your overall energy levels throughout the day?', options: [
      { label: 'Consistent and abundant — energetic from morning to evening', score: 0 },
      { label: 'Good with a moderate afternoon dip — recovers well', score: 1 },
      { label: 'Low — struggle to get through the day without resting', score: 2 },
      { label: 'Very low — basic tasks feel exhausting', score: 3 },
    ]},
    { text: 'Is your fatigue relieved by rest or sleep?', options: [
      { label: 'Yes — rest fully restores my energy', score: 0 },
      { label: 'Partially — better after rest but still tired', score: 1 },
      { label: 'Mostly no — wake up just as tired as when I went to sleep', score: 2 },
      { label: 'No — rest makes no difference or I feel worse', score: 3 },
    ]},
    { text: 'How does physical exertion affect you?', sub: 'Post-exertional malaise is a key chronic fatigue indicator', options: [
      { label: 'Normal — recover within an hour after exercise', score: 0 },
      { label: 'Mildly tired — need longer recovery than before', score: 1 },
      { label: 'Significantly worse for 24+ hours after mild exertion', score: 3 },
      { label: 'Crash — even light activity causes days of exhaustion', score: 4 },
    ]},
    { text: 'How long have you experienced significant fatigue?', options: [
      { label: 'Less than 1 month — acute or recent onset', score: 1 },
      { label: '1–3 months — subacute', score: 2 },
      { label: '3–6 months — persistent', score: 3 },
      { label: 'More than 6 months — chronic', score: 4 },
      { label: 'No significant fatigue', score: 0 },
    ]},
    { text: 'Do you experience any of these alongside your fatigue?', sub: 'Select the one that best applies', options: [
      { label: 'None of these', score: 0 },
      { label: 'Brain fog — difficulty thinking, poor memory', score: 2 },
      { label: 'Muscle pain or widespread body aches', score: 2 },
      { label: 'Frequent infections — lowered immunity', score: 2 },
      { label: 'Multiple of the above — significant impact on daily life', score: 4 },
    ]},
    { text: 'What is your relationship with stress and workload?', options: [
      { label: 'Manageable — I handle stress well', score: 0 },
      { label: 'Some overwhelm — but recovering', score: 1 },
      { label: 'Chronically stressed — burnout territory', score: 3 },
      { label: 'Completely burnt out — cannot function normally', score: 4 },
    ]},
    { text: 'How is your motivation and enthusiasm for life?', options: [
      { label: 'Strong — engaged and motivated', score: 0 },
      { label: 'Variable — good days and flat days', score: 1 },
      { label: 'Low — difficulty finding joy or motivation', score: 2 },
      { label: 'Absent — everything feels effortful and joyless', score: 3 },
    ]},
    { text: 'What best describes your physical health background?', options: [
      { label: 'Generally good — no major illness', score: 0 },
      { label: 'Recovered from COVID-19 in the last 6–18 months', score: 2 },
      { label: 'Chronic illness (thyroid, anaemia, diabetes, autoimmune)', score: 2 },
      { label: 'Multiple health conditions — complex picture', score: 3 },
    ]},
  ];

  function scoreTest(answers) {
    let total = 0;
    answers.forEach((a, i) => { if (a !== null) total += questions[i].options[a].score; });
    return total;
  }

  function onComplete(answers, score) {
    const maxScore = 27;
    let category, risk, ojasLevel;
    if (score <= 3)        { category = 'Excellent Energy — High Ojas'; risk = 'low'; ojasLevel = 'Para Ojas — Supreme Vitality'; }
    else if (score <= 7)   { category = 'Mild Fatigue — Monitor & Restore'; risk = 'low'; ojasLevel = 'Mild Ojas Depletion'; }
    else if (score <= 13)  { category = 'Moderate Fatigue — Ojas Rebuilding Required'; risk = 'moderate'; ojasLevel = 'Moderate Ojas Kshaya'; }
    else if (score <= 19)  { category = 'Significant Fatigue — Possible CFS/Burnout'; risk = 'high'; ojasLevel = 'Severe Ojas Depletion'; }
    else                   { category = 'Severe Fatigue — ME/CFS Pattern — Medical Care Needed'; risk = 'high'; ojasLevel = 'Critical Ojas Kshaya'; }

    const postCovid = answers[7] === 1;
    const postExertional = (answers[2] ?? 0) >= 2;

    renderResult(container, {
      icon: '⚡', title: 'Energy & Fatigue Assessment',
      score, maxScore, category, riskLevel: risk,
      breakdown: [
        { icon: '✨', label: 'Ojas Level', value: ojasLevel.split('—')[0].trim(), sub: 'Vital essence status' },
        { icon: '🔋', label: 'Energy Reserve', value: score <= 3 ? 'Full' : score <= 7 ? 'Good' : score <= 13 ? 'Depleted' : 'Critical', sub: 'Functional capacity' },
        { icon: '🦠', label: 'Post-COVID Risk', value: postCovid ? 'Possible Long COVID' : 'Not indicated', sub: 'Long COVID fatigue pattern' },
      ],
      ayurvedic: score <= 3
        ? 'Excellent Ojas — the master controller of immunity, vitality, and consciousness in Ayurveda. Ojas is the end-product of perfect digestion of all seven Dhatus. Maintain with Rasayana foods: Ashwagandha, Shatavari, Amalaki, ghee, warm milk and honey (not heated together), and sufficient Nidra (sleep). Brahmacharya (mindful use of vital energy) preserves Ojas.'
        : score <= 7
        ? 'Mild Ojas Kshaya (depletion) — typically from overwork, poor sleep, irregular eating, or stress. First-line Ayurvedic Rasaya protocol: Chyawanprash (1 tsp morning + 1 tsp evening — 43 herbs that rebuild Ojas over 3–6 months), Ashwagandha milk (KSM-66 extract), Shatavari ghee, and Vidarikanda (the premier Vata-Ojas tonic). Rest is the most undervalued medicine.'
        : postCovid
        ? 'Long COVID fatigue pattern detected. Ayurveda views Long COVID as post-infectious Dhatu Kshaya (tissue depletion) — especially Majja Dhatu (nervous system) and Sukra/Ojas. Classical treatment: Agasthya Rasayana (lung and energy restorer), Chyawanprash, Guduchi (Giloy) + Ashwagandha for immune-neurological restoration. Panchakarma — specifically Basti (enema) and Nasya — addresses the Vata-in-nerve-channels component.'
        : `Significant Ojas Kshaya — ${ojasLevel}. This level indicates systemic Dhatu depletion, possibly burnout or developing chronic fatigue. Classical Ashwagandha formula (Ashwagandhadi churna in desi milk), Shatavari Kalpa, Bala-Ashwagandha Taila Abhyanga (full body oil), and Shirodhara (6-session protocol) are the Ayurvedic answer. Please combine with medical evaluation.`,
      suggestions: [
        { icon: '🫙', title: 'Rasayana Protocol — Ojas Rebuilders', text: 'Chyawanprash: Take 1 tsp in warm milk morning and evening — this 43-herb formula (led by Amalaki) is the most clinically studied Rasayana, with documented adaptogenic, immunomodulatory, and mitochondrial-supportive effects. Ashwagandha (KSM-66): 300mg twice daily — reduces fatigue by 35% in clinical trials, specifically through cortisol reduction and DHEA support. Shatavari: rebuilds female Ojas specifically. Vidarikanda: premier male Ojas tonic.' },
        { icon: '🥛', title: 'Ojas-Building Foods', text: 'Ghee (2 tsp daily — the finest Ayurvedic brain and energy food), Warm full-fat milk with Ashwagandha and turmeric at night, Dates (soaked overnight), Almonds soaked overnight (12 almonds daily), Raw honey with warm water (not cooked — medicinal only when raw), Urad dal (highest Ojas-building legume), Sesame seeds. These foods specifically build Sukra Dhatu — the precursor of Ojas.' },
        ...(postExertional ? [{ icon: '🛑', title: 'Post-Exertional Malaise — Pacing Protocol', text: 'If minimal exertion causes crashes lasting 24+ hours, you may have ME/CFS (Myalgic Encephalomyelitis). The most important rule: DO NOT PUSH THROUGH. Graded Exercise Therapy (GET) is harmful for ME/CFS. Energy Envelope pacing — never exceeding your energy envelope — is evidence-based. In Ayurveda: complete Langhana (therapeutic rest), Basti therapy, and adaptogen protocol under physician guidance.' }] : [{ icon: '🌅', title: 'Dinacharya for Energy Restoration', text: 'The single most energy-restoring practice: consistent wake time (5:30 AM), 20 minutes of morning sunlight (serotonin + vitamin D3 synthesis — the foundation of afternoon energy), Abhyanga (oil massage activates the lymphatic system removing cellular fatigue metabolites), and no caffeine before 10 AM (cortisol is naturally highest before 10am — caffeine at this time blunts its effect, crashing energy by afternoon).' }]),
        { icon: '🩺', title: score >= 14 ? 'Get These Tests Done Urgently' : 'Useful Diagnostic Tests', text: 'Request from your doctor: Full blood count (anaemia), Thyroid (TSH, T3, T4), Vitamin D3 (deficiency in 70% of Indians), Vitamin B12, Ferritin (stored iron), HbA1c (blood sugar dysregulation), and Cortisol AM (adrenal fatigue). Most fatigue has a treatable root cause. Ayurvedic diagnosis adds: Nadi Pariksha (pulse for Dhatu assessment), and tongue examination (Jivha Pariksha) for Ama load.' },
      ],
    });
  }

  container.appendChild(buildQuizTest({ icon: '⚡', title: 'Energy & Fatigue Assessment', subtitle: '8 questions · Chronic Fatigue · Post-COVID · Ojas Depletion analysis', questions, scoreTest, onComplete }));
}
