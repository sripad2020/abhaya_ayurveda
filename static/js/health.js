/* ============================================================
   AyuSutra — health.js
   Comprehensive body metrics calculator
   BMI · BMR · TDEE · Body Fat · WHtR · IBW · LBM · BSA
   Risk Score · Fitness Category · Ayurvedic Insights
   ============================================================ */

let currentUnit = 'metric';
let selectedGender = 'male';

document.addEventListener('DOMContentLoaded', () => {
  initUnitToggle();
  initGenderSelector();
  document.getElementById('calcBtn').addEventListener('click', handleCalculate);
  document.getElementById('recalcBtn').addEventListener('click', showInputs);
});

// ── UNIT TOGGLE ───────────────────────────────────────────────
function initUnitToggle() {
  document.querySelectorAll('.unit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentUnit = btn.dataset.unit;
      updateUnitLabels();
      clearInputs();
    });
  });
}

function updateUnitLabels() {
  if (currentUnit === 'metric') {
    document.getElementById('heightUnit').textContent = 'cm';
    document.getElementById('weightUnit').textContent = 'kg';
    document.getElementById('waistUnit').textContent  = 'cm';
    document.getElementById('cHeight').placeholder = 'e.g. 170';
    document.getElementById('cWeight').placeholder = 'e.g. 70';
    document.getElementById('cWaist').placeholder  = 'e.g. 80';
  } else {
    document.getElementById('heightUnit').textContent = 'in';
    document.getElementById('weightUnit').textContent = 'lb';
    document.getElementById('waistUnit').textContent  = 'in';
    document.getElementById('cHeight').placeholder = 'e.g. 67';
    document.getElementById('cWeight').placeholder = 'e.g. 154';
    document.getElementById('cWaist').placeholder  = 'e.g. 31';
  }
}

function clearInputs() {
  ['cHeight','cWeight','cWaist'].forEach(id => document.getElementById(id).value = '');
}

// ── GENDER SELECTOR ───────────────────────────────────────────
function initGenderSelector() {
  document.querySelectorAll('.gender-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedGender = btn.dataset.val;
    });
  });
}

// ── VALIDATION ────────────────────────────────────────────────
function validate(age, height, weight, waist, activity) {
  let ok = true;

  const setE = (id, msg) => { document.getElementById(id).textContent = msg; ok = false; };
  const clrE = (id)       => { document.getElementById(id).textContent = ''; };

  if (!age || age < 10 || age > 100) setE('err-age', 'Enter a valid age (10–100).');
  else clrE('err-age');

  const [hMin, hMax] = currentUnit === 'metric' ? [100,250] : [39,98];
  if (!height || height < hMin || height > hMax) setE('err-height', `Enter a valid height.`);
  else clrE('err-height');

  const [wMin, wMax] = currentUnit === 'metric' ? [20,300] : [44,660];
  if (!weight || weight < wMin || weight > wMax) setE('err-weight', `Enter a valid weight.`);
  else clrE('err-weight');

  const [wsMin, wsMax] = currentUnit === 'metric' ? [40,200] : [16,79];
  if (!waist || waist < wsMin || waist > wsMax) setE('err-waist', 'Enter a valid waist measurement.');
  else clrE('err-waist');

  return ok;
}

// ── MAIN CALCULATE ────────────────────────────────────────────
function handleCalculate() {
  const age      = parseFloat(document.getElementById('cAge').value);
  const heightRaw= parseFloat(document.getElementById('cHeight').value);
  const weightRaw= parseFloat(document.getElementById('cWeight').value);
  const waistRaw = parseFloat(document.getElementById('cWaist').value);
  const activity = parseFloat(document.getElementById('cActivity').value) || 1.2;

  if (!validate(age, heightRaw, weightRaw, waistRaw, activity)) return;

  // Convert to metric
  const heightCm = currentUnit === 'metric' ? heightRaw : heightRaw * 2.54;
  const weightKg = currentUnit === 'metric' ? weightRaw : weightRaw * 0.4536;
  const waistCm  = currentUnit === 'metric' ? waistRaw  : waistRaw * 2.54;

  const heightM  = heightCm / 100;
  const isMale   = selectedGender === 'male';

  // ── CALCULATIONS ─────────────────────────────────────────────

  // 1. BMI
  const bmi = weightKg / (heightM * heightM);
  const bmiCat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : bmi < 35 ? 'Obese I' : 'Obese II+';
  const bmiClass = bmi < 18.5 ? 'tag-low' : bmi < 25 ? 'tag-normal' : bmi < 30 ? 'tag-overweight' : 'tag-obese';

  // 2. BMR (Mifflin-St Jeor)
  const bmr = isMale
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  // 3. TDEE
  const tdee = bmr * activity;

  // 4. Body Fat % (YMCA Formula — uses waist)
  let bfPct;
  if (isMale) {
    bfPct = -98.42 + (4.15 * waistCm / 2.54) - (0.082 * weightKg * 2.205);
  } else {
    bfPct = -76.76 + (4.15 * waistCm / 2.54) - (0.082 * weightKg * 2.205);
  }
  bfPct = Math.max(3, Math.min(60, bfPct));
  const bfCat = isMale
    ? (bfPct < 6 ? 'Essential' : bfPct < 14 ? 'Athletic' : bfPct < 18 ? 'Fit' : bfPct < 25 ? 'Average' : 'Obese')
    : (bfPct < 14 ? 'Essential' : bfPct < 21 ? 'Athletic' : bfPct < 25 ? 'Fit' : bfPct < 32 ? 'Average' : 'Obese');
  const bfClass = (bfCat === 'Athletic' || bfCat === 'Fit' || bfCat === 'Essential') ? 'tag-normal' : bfCat === 'Average' ? 'tag-overweight' : 'tag-obese';

  // 5. Waist-to-Height Ratio
  const whtr = waistCm / heightCm;
  const whtrCat = whtr < 0.4 ? 'Underweight' : whtr <= 0.5 ? 'Healthy' : whtr <= 0.6 ? 'Overweight' : 'Very High Risk';
  const whtrClass = whtr <= 0.5 ? 'tag-normal' : whtr <= 0.6 ? 'tag-overweight' : 'tag-obese';

  // 6. Ideal Body Weight (Devine Formula)
  const heightIn = heightCm / 2.54;
  const ibw = isMale
    ? 50 + 2.3 * (heightIn - 60)
    : 45.5 + 2.3 * (heightIn - 60);
  const ibwAdjusted = Math.max(30, ibw);

  // 7. Lean Body Mass
  const lbm = weightKg * (1 - bfPct / 100);

  // 8. Body Surface Area (Du Bois)
  const bsa = 0.007184 * Math.pow(heightCm, 0.725) * Math.pow(weightKg, 0.425);

  // 9. Fat Distribution (Apple vs Pear)
  const waistHeightRatio = waistCm / heightCm;
  const fatDist = waistHeightRatio > 0.5 ? 'Apple 🍎' : 'Pear 🍐';
  const fatDistTag = waistHeightRatio > 0.5 ? 'tag-overweight' : 'tag-normal';
  const fatDistText = waistHeightRatio > 0.5 ? 'Central / Visceral Fat' : 'Peripheral Fat';

  // 10. Fitness Category
  let fitCat, fitClass;
  if (isMale) {
    fitCat = bfPct < 14 ? 'Athlete 🏆' : bfPct < 18 ? 'Fit 💪' : bfPct < 25 ? 'Average 🧘' : 'High Fat ⚠️';
    fitClass = bfPct < 14 ? 'tag-normal' : bfPct < 18 ? 'tag-normal' : bfPct < 25 ? 'tag-overweight' : 'tag-obese';
  } else {
    fitCat = bfPct < 21 ? 'Athlete 🏆' : bfPct < 25 ? 'Fit 💪' : bfPct < 32 ? 'Average 🧘' : 'High Fat ⚠️';
    fitClass = bfPct < 21 ? 'tag-normal' : bfPct < 25 ? 'tag-normal' : bfPct < 32 ? 'tag-overweight' : 'tag-obese';
  }

  // 11. Risk Score (0–100)
  let risk = 0;
  // BMI contribution
  if (bmi >= 30) risk += 30;
  else if (bmi >= 25) risk += 15;
  else if (bmi < 18.5) risk += 10;
  // Waist-to-height
  if (whtr > 0.6) risk += 25;
  else if (whtr > 0.5) risk += 12;
  // Body fat
  const bfHigh = isMale ? bfPct > 25 : bfPct > 32;
  if (bfHigh) risk += 20;
  else if (isMale ? bfPct > 18 : bfPct > 25) risk += 8;
  // Age factor
  if (age > 60) risk += 15;
  else if (age > 45) risk += 8;
  else if (age > 35) risk += 4;
  // Activity
  if (activity <= 1.2) risk += 10;
  risk = Math.min(100, risk);

  // 12. Calorie targets
  const calLose     = Math.round(tdee - 500);
  const calGain     = Math.round(tdee + 500);

  // ── RENDER ───────────────────────────────────────────────────
  renderResults({
    bmi, bmiCat, bmiClass,
    bmr, tdee,
    bfPct, bfCat, bfClass,
    whtr, whtrCat, whtrClass,
    ibw: ibwAdjusted, lbm, bsa,
    fatDist, fatDistTag, fatDistText,
    fitCat, fitClass,
    risk,
    calLose, calGain,
    weightKg, heightCm, waistCm, age,
    isMale, activity
  });
}

// ── RENDER RESULTS ────────────────────────────────────────────
function renderResults(d) {
  // Overview
  const catName = d.bmi < 18.5 ? 'Underweight' : d.bmi < 25 ? 'Normal Weight' : d.bmi < 30 ? 'Overweight' : 'Obese';
  document.getElementById('overviewName').textContent = `Health Portrait · ${catName}`;
  document.getElementById('overviewCategory').textContent =
    `Age ${d.age} · ${d.isMale ? 'Male' : 'Female'} · BMI ${d.bmi.toFixed(1)} · Risk Score ${d.risk}/100`;

  // Risk needle
  const riskPct = d.risk;
  document.getElementById('riskNeedle').style.left = riskPct + '%';
  document.getElementById('riskNum').textContent = d.risk;

  // BMI
  document.getElementById('resBMI').textContent   = d.bmi.toFixed(1);
  setTag('resBMITag', d.bmiCat, d.bmiClass);
  const bmiBarPct = Math.min(100, ((d.bmi - 10) / 35) * 100);
  animateBar('bmiFill', bmiBarPct);
  document.getElementById('bmiInsight').textContent = bmiInsightText(d.bmi, d.bmiCat);

  // BMR
  animateNumber('resBMR', Math.round(d.bmr));
  document.getElementById('bmrInsight').textContent =
    `Your body burns ${Math.round(d.bmr)} kcal per day at complete rest — just to sustain breathing, circulation, and organ function. This is your minimum energy floor.`;

  // TDEE
  animateNumber('resTDEE', Math.round(d.tdee));
  const actLabel = ['Sedentary','Lightly Active','Moderately Active','Very Active','Extremely Active'];
  const actIdx   = [1.2,1.375,1.55,1.725,1.9].indexOf(d.activity);
  document.getElementById('tdeeInsight').textContent =
    `As a ${actLabel[actIdx] || 'active'} person, you expend ~${Math.round(d.tdee)} kcal/day. Eating at this level maintains your current weight.`;

  // Body Fat
  animateNumber('resBF', Math.round(d.bfPct));
  document.getElementById('bfDonutLabel').textContent = Math.round(d.bfPct) + '%';
  setTag('resBFTag', d.bfCat, d.bfClass);
  animateDonut('bfDonut', d.bfPct, 60);
  document.getElementById('bfInsight').textContent = bfInsightText(d.bfPct, d.bfCat, d.isMale);

  // WHtR
  document.getElementById('resWHtR').textContent = d.whtr.toFixed(3);
  setTag('resWHtRTag', d.whtrCat, d.whtrClass);
  document.getElementById('whtrInsight').textContent = whtrInsightText(d.whtr, d.whtrCat);

  // Ideal Weight
  document.getElementById('resIBW').textContent = d.ibw.toFixed(1);
  const weightDiff = (d.weightKg - d.ibw).toFixed(1);
  document.getElementById('ibwInsight').textContent =
    weightDiff > 0
      ? `You are ${weightDiff} kg above your ideal weight. A steady, sustainable approach (0.5 kg/week loss) via balanced Ayurvedic diet is recommended.`
      : weightDiff < -2
      ? `You are ${Math.abs(weightDiff)} kg below ideal weight. Nutrient-dense foods, wholesome fats and Ayurvedic Rasayanas can support healthy weight gain.`
      : `You are very close to your ideal body weight. Maintain through balanced lifestyle and mindful eating.`;

  // LBM
  document.getElementById('resLBM').textContent = d.lbm.toFixed(1);
  document.getElementById('lbmInsight').textContent =
    `Your lean mass (muscles, bones, organs) is ~${d.lbm.toFixed(1)} kg. Preserving lean mass during weight loss requires adequate protein (1.2–1.6 g/kg) and resistance activity.`;

  // BSA
  document.getElementById('resBSA').textContent = d.bsa.toFixed(2);
  document.getElementById('bsaInsight').textContent =
    `Body surface area is used in clinical settings for drug dosing and metabolic scaling. Your BSA of ${d.bsa.toFixed(2)} m² is within the typical adult range of 1.5–2.1 m².`;

  // Fat Distribution
  document.getElementById('resFatDist').textContent = d.fatDist;
  setTag('resFatDistTag', d.fatDistText, d.fatDistTag);
  document.getElementById('fatDistInsight').textContent = fatDistInsightText(d.fatDist, d.whtr);

  // Fitness Category
  document.getElementById('resFitCat').textContent = d.fitCat;
  setTag('resFitCatTag', fitCatSubText(d.fitCat), d.fitClass);
  document.getElementById('fitCatInsight').textContent = fitCatInsightText(d.fitCat, d.bfPct);

  // Calories
  document.getElementById('calLose').textContent     = d.calLose;
  document.getElementById('calMaintain').textContent = Math.round(d.tdee);
  document.getElementById('calGain').textContent     = d.calGain;

  // Ayurvedic insights
  renderAyurvedic(d);

  // Suggestions
  renderSuggestions(d);

  // Show results
  document.getElementById('calcInputCard').style.display = 'none';
  document.getElementById('calcResults').style.display = 'block';
  window.scrollTo({ top: document.getElementById('calcResults').offsetTop - 100, behavior: 'smooth' });
}

// ── HELPER: tags ──────────────────────────────────────────────
function setTag(id, text, cls) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className   = 'mc-tag ' + (cls || 'normal-tag');
}

// ── ANIMATE NUMBER ────────────────────────────────────────────
function animateNumber(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let start = 0;
  const dur = 1200;
  const t0  = performance.now();
  function tick(now) {
    const p = Math.min((now - t0) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(e * target).toLocaleString('en-IN');
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ── ANIMATE BAR ───────────────────────────────────────────────
function animateBar(id, pct) {
  const el = document.getElementById(id);
  if (!el) return;
  setTimeout(() => { el.style.width = Math.min(100, pct) + '%'; }, 100);
}

// ── ANIMATE DONUT ─────────────────────────────────────────────
function animateDonut(id, value, max) {
  const el = document.getElementById(id);
  if (!el) return;
  const circumference = 2 * Math.PI * 30; // r=30
  const pct  = Math.min(value / max, 1);
  const dash = pct * circumference;
  setTimeout(() => {
    el.style.strokeDashoffset = circumference - dash;
  }, 200);
}

// ── INSIGHT TEXT HELPERS ──────────────────────────────────────
function bmiInsightText(bmi, cat) {
  if (cat === 'Underweight')  return 'Low BMI can indicate insufficient nutrient reserves, weakened immunity, and low energy — Ayurveda associates this with Vata imbalance.';
  if (cat === 'Normal')       return 'Your BMI is in the healthy range. Ayurveda recognises this as Sama Deha — balanced constitution. Maintain through mindful eating and daily routine.';
  if (cat === 'Overweight')   return 'Slightly elevated BMI increases risk of insulin resistance, joint stress, and cardiovascular strain. Kapha dosha may be dominant — light, warm foods and regular movement help.';
  if (cat.includes('Obese'))  return 'Obesity significantly elevates risk of diabetes, hypertension, sleep apnoea, and joint degeneration. Ayurvedic Langhan (therapeutic fasting) and Panchakarma detox are highly effective.';
  return '';
}

function bfInsightText(bf, cat, isMale) {
  if (cat === 'Essential') return 'Critically low fat — essential fat is needed for organ protection and hormonal function. Seek medical guidance.';
  if (cat === 'Athletic')  return 'Excellent fat percentage, typical of trained athletes. Supports peak performance and hormonal balance.';
  if (cat === 'Fit')       return 'Good fitness level. Body composition supports metabolic health, energy levels, and longevity.';
  if (cat === 'Average')   return 'Average body fat. There is opportunity to reduce fat mass through consistent activity and dietary adjustments.';
  return 'Elevated body fat increases metabolic disease risk. Focus on reducing visceral fat through movement, dietary discipline, and stress management.';
}

function whtrInsightText(whtr, cat) {
  if (cat === 'Healthy')       return 'Waist-to-height ratio is in the safe zone. Central fat accumulation is low, indicating reduced cardiovascular and metabolic risk.';
  if (cat === 'Overweight')    return 'Borderline central fat. Waist circumference above 50% of height signals early visceral fat accumulation — a risk factor for metabolic syndrome.';
  if (cat === 'Very High Risk') return 'High central fat is strongly linked to insulin resistance, hypertension, and cardiovascular disease. Targeted abdominal fat reduction is a clinical priority.';
  if (cat === 'Underweight')   return 'Very low waist-to-height ratio — may indicate underweight status.';
  return '';
}

function fatDistInsightText(type, whtr) {
  if (type.includes('Apple')) {
    return 'Apple-shaped fat distribution (central/abdominal) significantly elevates cardiovascular and diabetes risk. Visceral fat surrounds organs and drives systemic inflammation.';
  }
  return 'Pear-shaped fat (hips and thighs) carries lower cardiovascular risk than central fat. However, excess peripheral fat still impacts joint health and mobility.';
}

function fitCatSubText(cat) {
  if (cat.includes('Athlete'))  return 'Elite Fitness';
  if (cat.includes('Fit'))      return 'Good Fitness';
  if (cat.includes('Average'))  return 'Moderate';
  return 'Needs Attention';
}

function fitCatInsightText(cat, bf) {
  if (cat.includes('Athlete'))  return `With ~${Math.round(bf)}% body fat, you demonstrate athletic-grade body composition. Maintain with periodised training and Ayurvedic recovery practices.`;
  if (cat.includes('Fit'))      return `Your fitness level is good. Structured progressive exercise 4–5 days/week and a protein-adequate diet will sustain and improve your composition.`;
  if (cat.includes('Average'))  return `Average fitness — a consistent routine combining strength and cardiovascular training will yield significant improvement over 12–16 weeks.`;
  return `Body fat levels indicate high risk. A medically guided fat-loss programme — combining Ayurvedic diet, stress management, sleep correction, and exercise — is strongly advised.`;
}

// ── AYURVEDIC INSIGHTS ────────────────────────────────────────
function renderAyurvedic(d) {
  const cards = [];

  // Dosha based on BMI/body type
  let dosha, doshaText;
  if (d.bmi < 19) {
    dosha = 'Vata Dominance';
    doshaText = 'Your lean physique suggests Vata constitution. Vata types tend toward irregular digestion, dry skin, anxiety, and light sleep. Grounding, warm, oily foods and herbs like Ashwagandha and Shatavari restore balance.';
  } else if (d.bmi >= 19 && d.bmi < 26 && d.bfPct < 25) {
    dosha = 'Pitta–Kapha Balance';
    doshaText = 'Your balanced composition reflects Pitta-Kapha harmony. Maintain this balance with seasonal cleansing (Ritucharya), bitter greens, cooling herbs like Amalaki, and moderate physical activity.';
  } else {
    dosha = 'Kapha Dominance';
    doshaText = 'Excess weight, sluggish metabolism, and central fat are signs of Kapha imbalance. Ayurveda prescribes Langhan (reduction therapy), heating spices (ginger, black pepper), and regular vigorous exercise.';
  }

  cards.push({ icon: '🌸', title: dosha, text: doshaText });

  // Agni (digestive fire)
  const agniText = d.bmi < 18.5
    ? 'Vishama Agni — irregular, variable digestive fire. Favour warm cooked meals, avoid raw and cold foods, eat at consistent times. Triphala and cumin water support regularity.'
    : d.bmi < 26
    ? 'Sama Agni — balanced digestive fire. Protect it with seasonal fasting (Ekadashi), mindful eating, and avoiding incompatible food combinations (Viruddha Ahara).'
    : 'Manda Agni — slow, heavy digestive fire. Eat light, warm, spiced meals. Trikatu (ginger, pepper, pippali) kindles Agni. Avoid daytime sleep and heavy foods after sunset.';
  cards.push({ icon: '🔥', title: 'Agni (Digestive Fire)', text: agniText });

  // Cardiovascular risk in Ayurvedic context
  const hridayText = d.risk > 50
    ? 'Elevated cardiovascular risk detected. Ayurveda recommends Arjuna bark (Terminalia arjuna) as a cardiotonic, combined with Pranayama (Anulom Vilom, Bhramari) to reduce sympathetic nervous system activation and arterial tension.'
    : d.risk > 25
    ? 'Moderate cardiovascular indicators. Regular Pranayama, reduced sodium and saturated fat, adequate sleep, and Brahmi for stress management support heart health significantly.'
    : 'Low cardiovascular risk. Continue with Dinacharya (daily routine) — oil pulling, tongue scraping, morning movement, and early dinner to sustain this protection.';
  cards.push({ icon: '🫀', title: 'Hridaya (Heart Health)', text: hridayText });

  const html = cards.map(c => `
    <div class="ayur-card">
      <span class="ayur-card-icon">${c.icon}</span>
      <h4>${c.title}</h4>
      <p>${c.text}</p>
    </div>
  `).join('');

  document.getElementById('ayurCards').innerHTML = html;
}

// ── SUGGESTIONS ───────────────────────────────────────────────
function renderSuggestions(d) {
  const sugs = [];

  // Diet
  if (d.bmi >= 25) {
    sugs.push({ icon: '🥗', title: 'Kapha-Pacifying Diet', text: 'Favour light, warm, dry foods. Reduce dairy, sweets, and fried items. Incorporate bitter gourd, fenugreek, and turmeric. Eat your largest meal at midday when Agni is strongest.' });
  } else if (d.bmi < 18.5) {
    sugs.push({ icon: '🥜', title: 'Vata-Nourishing Diet', text: 'Prioritise warm, oily, nourishing foods — ghee, sesame, soaked nuts, root vegetables. Eat at regular times. Avoid cold drinks, excessive raw foods, and irregular meal timing.' });
  } else {
    sugs.push({ icon: '🫚', title: 'Sattvic Balanced Diet', text: 'Maintain your balance with seasonal, locally grown foods. Follow Mitahara (moderate eating) — fill half the stomach with food, one quarter with water, one quarter with air.' });
  }

  // Exercise
  const actScore = d.activity;
  if (actScore <= 1.375) {
    sugs.push({ icon: '🧘', title: 'Movement as Medicine', text: 'Begin with 30 min of brisk walking daily. Add yoga (Surya Namaskar × 12 rounds) 4x/week. Ayurveda prescribes Vyayama (exercise) to half capacity — until perspiration appears on forehead and armpits.' });
  } else {
    sugs.push({ icon: '💪', title: 'Optimise Your Training', text: 'Your activity level is commendable. Periodise your training — include strength, mobility, and restorative sessions. Post-workout Abhyanga (self-massage) with sesame oil speeds recovery.' });
  }

  // Sleep & Stress
  if (d.risk > 40) {
    sugs.push({ icon: '🌙', title: 'Nidra (Therapeutic Sleep)', text: 'Chronic stress and poor sleep elevate cortisol, driving abdominal fat gain. Target 7–8 hours. Wind down with warm milk + ashwagandha. Practice Yoga Nidra (body scan meditation) for deep nervous system restoration.' });
  } else {
    sugs.push({ icon: '🌙', title: 'Sleep Hygiene', text: 'Sleep before 10:30 PM to align with Kapha time (10 PM–2 AM). Avoid screens 1 hour before bed. A brief Abhyanga (warm oil self-massage) on feet promotes deep, restorative sleep.' });
  }

  // Body fat specific
  if (d.bfPct > (d.isMale ? 25 : 32)) {
    sugs.push({ icon: '🏃', title: 'Visceral Fat Reduction', text: 'Prioritise interval training (HIIT) 3x/week — proven most effective against visceral fat. Combine with time-restricted eating (16:8 window). Guggulu and Triphala support fat metabolism in Ayurveda.' });
  }

  // Hydration
  sugs.push({ icon: '💧', title: 'Jala (Sacred Water)', text: `Your estimated daily water need is ~${((d.weightKg * 35) / 1000).toFixed(1)}L. Drink warm or room-temperature water — never ice cold (dampens Agni). Copper vessel water (Tamra Jala) has antimicrobial and digestive benefits per classical texts.` });

  // Calorie awareness
  sugs.push({ icon: '📊', title: 'Energy Balance', text: `Your TDEE is ${Math.round(d.tdee)} kcal/day. For 0.5 kg/week fat loss, target ${Math.round(d.tdee - 500)} kcal. For muscle gain, target ${Math.round(d.tdee + 300)} kcal with strength training 4x/week.` });

  // WHtR warning
  if (d.whtr > 0.5) {
    sugs.push({ icon: '⚠️', title: 'Reduce Central Fat', text: 'Your waist-to-height ratio signals visceral fat accumulation. Even 5–10% body weight reduction significantly lowers diabetes and heart disease risk. Panchakarma (specifically Udwarthana — dry herbal powder massage) targets stubborn belly fat.' });
  }

  // Consultation CTA
  sugs.push({ icon: '🩺', title: 'Consult an Ayurvedic Physician', text: 'For a comprehensive Nadi Pariksha (pulse diagnosis), personalised herbal formulations, and a structured Panchakarma programme, book a free consultation with our Ayurvedic physicians.' });

  const html = sugs.map(s => `
    <div class="sug-card">
      <div class="sug-icon">${s.icon}</div>
      <div class="sug-body">
        <h4>${s.title}</h4>
        <p>${s.text}</p>
      </div>
    </div>
  `).join('');

  document.getElementById('sugGrid').innerHTML = html;
}

// ── SHOW INPUTS AGAIN ────────────────────────────────────────
function showInputs() {
  document.getElementById('calcResults').style.display  = 'none';
  document.getElementById('calcInputCard').style.display = 'block';
  window.scrollTo({ top: document.getElementById('calcInputCard').offsetTop - 100, behavior: 'smooth' });
}