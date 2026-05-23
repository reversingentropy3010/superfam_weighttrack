'use strict';

// ── Global state ─────────────────────────────────────────────────────
var _original  = null;
var _data      = null;
var _chart     = null;
var _chartMode = 'weight';  // 'weight' | 'pct' | 'points'
var _view      = 'stats';   // 'stats'  | 'race'

// ── Countdown (to next 1st-of-month weigh-in) ────────────────────────
function startWeighInCountdown() {
  function nextFirst() {
    var n = new Date();
    return new Date(n.getFullYear(), n.getMonth() + 1, 1);
  }
  function tick() {
    var target = nextFirst();
    var diff   = target - new Date();
    if (diff <= 0) diff = 0;
    document.getElementById('cd-days').textContent = Math.floor(diff / 864e5);
    document.getElementById('cd-hrs').textContent  = Math.floor((diff % 864e5) / 36e5);
    document.getElementById('cd-min').textContent  = Math.floor((diff % 36e5) / 6e4);
    document.getElementById('cd-sec').textContent  = Math.floor((diff % 6e4) / 1e3);
    var lbl = document.getElementById('weighin-label');
    if (lbl) lbl.innerHTML = '⏱️ Next weigh-in: <strong>'
      + target.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      + '</strong> · Deadline <strong>November 1, 2027</strong>';
  }
  tick();
  setInterval(tick, 1000);
}

// ── Master re-render ─────────────────────────────────────────────────
function rerender() {
  var dates  = allDates(_data.participants);
  var result = computeScores(_data);
  renderLeaderboard(result.scored);
  renderPhaseCards(result.scored);
  renderScoreBreakdown(result.scored);
  if (dates.length > 0) renderChart(_data.participants, dates, result.scored);
  renderHistory(_data.participants, dates, result.monthlyWinners);
  setLastUpdated(_data.participants);
  renderRace(result.scored);
}

// ── Bootstrap ────────────────────────────────────────────────────────
(function() {
  fetch('data.json?v=' + Date.now())
    .then(function(r) { return r.json(); })
    .then(function(data) {
      _original = data;
      _data     = JSON.parse(JSON.stringify(data));
      startWeighInCountdown();
      initDevConsole(_data.participants);
      rerender();
    });
})();
