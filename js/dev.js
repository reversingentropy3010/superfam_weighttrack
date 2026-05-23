'use strict';

// Depends on: utils.js (shortDate)
// Reads/writes globals: _data, _original (defined in main.js)
// Calls: rerender (defined in main.js)

function devToggle() { document.getElementById('dev-console').classList.toggle('open'); }

function dcLog(msg, isErr) {
  var el = document.getElementById('dc-log');
  el.textContent = msg;
  el.className   = 'dev-log' + (isErr ? ' err' : '');
}

function dcInject() {
  var pid    = document.getElementById('dc-participant').value;
  var month  = document.getElementById('dc-date').value;
  var weight = parseFloat(document.getElementById('dc-weight').value);

  if (!pid || !month || isNaN(weight) || weight <= 0) { dcLog('⚠ Fill in all fields correctly.', true); return; }
  if (!/^\d{4}-\d{2}$/.test(month)) { dcLog('⚠ Invalid date format.', true); return; }

  var date = month + '-01';
  var p    = _data.participants.find(function(x) { return x.id === pid; });
  if (!p) { dcLog('⚠ Participant not found.', true); return; }

  var idx = p.entries.findIndex(function(e) { return e.date === date; });
  if (idx >= 0) {
    p.entries[idx].weight = weight;
    dcLog('✓ Updated ' + p.name + ' on ' + shortDate(date) + ': ' + weight + ' kg');
  } else {
    p.entries.push({ date: date, weight: weight });
    p.entries.sort(function(a, b) { return a.date.localeCompare(b.date); });
    dcLog('✓ Added ' + p.name + ' on ' + shortDate(date) + ': ' + weight + ' kg');
  }
  rerender();
}

function dcExport() {
  var blob = new Blob([JSON.stringify(_data, null, 2)], { type: 'application/json' });
  var a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = 'data.json';
  a.click();
  dcLog('✓ Exported data.json');
}

function dcReset() {
  _data = JSON.parse(JSON.stringify(_original));
  rerender();
  dcLog('✓ Reset to original data.');
}

function dcLoadTestData() {
  _data = JSON.parse(JSON.stringify(_original));
  var months = [
    '2026-05-01','2026-06-01','2026-07-01','2026-08-01',
    '2026-09-01','2026-10-01','2026-11-01','2026-12-01',
  ];
  // Realistic data: similar absolute pace (~1–1.5 kg/month), each has at least one slip
  // SC:  goal 75 (–15 kg). Steady with Sep slip. Still racing.
  // JC:  goal 80 (–15 kg). Two slips (Jul, Oct). Still racing.
  // CHC: goal 85 (–10 kg). Sep slip, then strong finish. Hits goal Dec → Phase 2.
  var testWeights = {
    'SC':  [90, 88, 87, 85, 86, 84, 83, 81, 77, 75, 74, 74, 73],
    'JC':  [95, 93, 95, 93, 91, 93, 91, 89, 86, 80, 80, 79, 78],
    'CHC': [95, 94, 93, 91, 92, 90, 91, 88, 86, 85, 85, 84, 84],
  };
  _data.participants.forEach(function(p) {
    var ws = testWeights[p.id];
    if (ws) p.entries = months.map(function(d, i) { return { date: d, weight: ws[i] }; });
  });
  rerender();
  dcLog(
    '✓ Loaded 8-month test data.\n' +
    'SC  → –9 kg, 1 slip (Sep), still racing (goal 75)\n' +
    'JC  → –6 kg, 2 slips (Jul, Oct), still racing (goal 80)\n' +
    'CHC → –10 kg, 1 slip (Sep), hits goal (85) Dec → Phase 2\n\n' +
    'Gain months = 0 pts + streak reset'
  );
}

function initDevConsole(participants) {
  document.getElementById('dc-participant').innerHTML =
    participants.map(function(p) { return '<option value="' + p.id + '">' + p.name + '</option>'; }).join('');
  var d = new Date();
  d.setMonth(d.getMonth() + 1);
  document.getElementById('dc-date').value = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}
