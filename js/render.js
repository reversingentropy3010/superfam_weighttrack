'use strict';

// Depends on: utils.js, scoring.js
// Reads globals: _chart, _chartMode, _data (defined in main.js)

// ── Leaderboard ──────────────────────────────────────────────────────
function renderLeaderboard(scored) {
  var medals  = ['🥇','🥈','🥉'];
  var rankCls = ['rank-1','rank-2','rank-3'];
  var sorted  = scored.slice().sort(function(a, b) { return b.sd.total - a.sd.total; });
  document.getElementById('leaderboard').innerHTML = sorted.map(function(p, i) {
    var cur = lastEntry(p);
    var pct = progressPct(p.startWeight, p.goalWeight, cur ? cur.weight : p.startWeight);
    var pb  = p.sd.phase === 2
      ? '<span class="phase-badge p2">🛡️ Phase 2 – Holding</span>'
      : '<span class="phase-badge p1">🏃 Phase 1 – Racing</span>';
    return '<div class="lb-card ' + (rankCls[i] || '') + '" style="--accent:' + p.color + '">'
      + '<div class="lb-medal">' + (medals[i] || (i+1)+'.') + '</div>'
      + '<div class="lb-name" style="color:' + p.color + '">' + p.name + '</div>'
      + '<div class="lb-pts">' + Math.round(p.sd.total) + '</div>'
      + '<div class="lb-pts-lbl">points</div>'
      + '<div class="lb-sub">' + (cur ? cur.weight + ' kg current' : 'No data') + '<br>' + fmt(pct) + '% to goal</div>'
      + pb + '</div>';
  }).join('');
}

// ── Phase cards ──────────────────────────────────────────────────────
function renderPhaseCards(scored) {
  var p1 = scored.filter(function(p) { return p.sd.phase === 1; });
  var p2 = scored.filter(function(p) { return p.sd.phase === 2; });
  document.getElementById('s-phase2').style.display = p2.length ? '' : 'none';

  function cardHtml(p) {
    var cur    = lastEntry(p);
    var srtd   = sortedEntries(p);
    var prev   = srtd.length >= 2 ? srtd[srtd.length - 2] : null;
    var curW   = cur ? cur.weight : p.startWeight;
    var change = (cur && prev) ? prev.weight - cur.weight : null;
    var chStr  = change === null ? '—' : change > 0 ? '▼ ' + fmt(change) + ' kg' : change < 0 ? '▲ ' + fmt(Math.abs(change)) + ' kg' : '—';
    var chCls  = change > 0 ? 'pos' : change < 0 ? 'neg' : '';
    var streakIcon  = p.sd.phase === 2 ? '🛡️' : '🔥';
    var streakLabel = p.sd.phase === 2 ? '-month hold' : '-month';
    var streakBadge = p.sd.streak >= 2 ? '<div class="streak-badge">' + streakIcon + ' ' + p.sd.streak + streakLabel + ' streak</div>' : '';

    if (p.sd.phase === 1) {
      var rem = curW - p.goalWeight;
      var pct = progressPct(p.startWeight, p.goalWeight, curW);
      return '<div class="p-card" style="--accent:' + p.color + '">'
        + '<div class="p-card-header">'
        +   '<div class="p-card-name" style="color:' + p.color + '">' + p.name + '</div>'
        +   '<div class="p-card-pts"><div class="pts-num">' + Math.round(p.sd.total) + '</div><div class="pts-lbl">pts</div></div>'
        + '</div>'
        + '<div class="stat-row"><span class="stat-label">Current weight</span><span class="stat-value">' + fmt(curW) + ' kg</span></div>'
        + '<div class="stat-row"><span class="stat-label">Goal weight</span><span class="stat-value">' + p.goalWeight + ' kg</span></div>'
        + '<div class="stat-row"><span class="stat-label">Still to lose</span><span class="stat-value ' + (rem <= 0 ? 'pos' : '') + '">' + (rem > 0 ? fmt(rem) + ' kg' : '🎉 At goal!') + '</span></div>'
        + '<div class="stat-row"><span class="stat-label">Last change</span><span class="stat-value ' + chCls + '">' + chStr + '</span></div>'
        + '<div class="prog-track"><div class="prog-fill" style="width:' + pct + '%"></div></div>'
        + '<div class="prog-labels"><span>' + p.startWeight + ' kg</span><span>🏁 ' + p.goalWeight + ' kg</span></div>'
        + '<div class="prog-pct" style="color:' + p.color + '">' + fmt(pct, 0) + '% complete</div>'
        + streakBadge + '</div>';
    } else {
      var kgUnder = p.goalWeight - curW;
      var since   = p.sd.goalAchievedDate ? shortDate(p.sd.goalAchievedDate) : '–';
      return '<div class="p-card" style="--accent:' + p.color + '">'
        + '<div class="p-card-header">'
        +   '<div class="p-card-name" style="color:' + p.color + '">' + p.name + '</div>'
        +   '<div class="p-card-pts"><div class="pts-num">' + Math.round(p.sd.total) + '</div><div class="pts-lbl">pts</div></div>'
        + '</div>'
        + '<div class="stat-row"><span class="stat-label">Current weight</span><span class="stat-value">' + fmt(curW) + ' kg</span></div>'
        + '<div class="stat-row"><span class="stat-label">Goal weight</span><span class="stat-value">' + p.goalWeight + ' kg</span></div>'
        + '<div class="stat-row"><span class="stat-label">Status</span><span class="stat-value ' + (curW <= p.goalWeight ? 'pos' : 'neg') + '">' + (curW <= p.goalWeight ? '✅ ' + fmt(kgUnder) + ' kg under goal' : '⚠️ ' + fmt(-kgUnder) + ' kg over goal') + '</span></div>'
        + '<div class="stat-row"><span class="stat-label">Last change</span><span class="stat-value ' + chCls + '">' + chStr + '</span></div>'
        + '<div class="stat-row"><span class="stat-label">Maintaining since</span><span class="stat-value gold">' + since + '</span></div>'
        + streakBadge + '</div>';
    }
  }

  document.getElementById('phase1-cards').innerHTML = p1.map(cardHtml).join('') || '<p style="color:var(--text-muted);font-size:.88rem">No participants in Phase 1.</p>';
  document.getElementById('phase2-cards').innerHTML = p2.map(cardHtml).join('');
}

// ── Score breakdown ──────────────────────────────────────────────────
function renderScoreBreakdown(scored) {
  var typeInfo = {
    loss:     { cls: 'ev-loss',     lbl: 'Phase 1 Loss'    },
    maintain: { cls: 'ev-maintain', lbl: 'Phase 2 Maintain'},
    goal:     { cls: 'ev-goal',     lbl: 'Goal Bonus 🎉'   },
    streak:   { cls: 'ev-streak',   lbl: 'Streak Bonus'    },
    win:      { cls: 'ev-win',      lbl: 'Monthly Win'     },
  };

  document.getElementById('score-bd-container').innerHTML = scored
    .slice().sort(function(a,b){ return b.sd.total - a.sd.total; })
    .map(function(p) {
      var rows = p.sd.events.length
        ? p.sd.events.map(function(ev) {
            var info   = typeInfo[ev.type] || { cls: 'ev-loss', lbl: ev.type };
            var ptsStr = ev.pts > 0 ? '+' + (Math.round(ev.pts * 10) / 10) : '—';
            return '<tr>'
              + '<td>' + shortDate(ev.date) + '</td>'
              + '<td><span class="ev-type ' + info.cls + '">' + info.lbl + '</span></td>'
              + '<td style="color:' + (ev.pts > 0 ? '#34d399' : 'var(--text-muted)') + '">' + ptsStr + '</td>'
              + '<td style="color:var(--text-muted);font-size:.8rem">' + ev.note + '</td>'
              + '</tr>';
          }).join('') + '<tr class="total-row"><td colspan="2">Total</td><td>' + Math.round(p.sd.total) + ' pts</td><td></td></tr>'
        : '<tr><td colspan="4" style="color:var(--text-muted);padding:.75rem 0">No scoring events yet – add a second weigh-in via Dev Console.</td></tr>';

      return '<details class="score-bd">'
        + '<summary>'
        +   '<span style="color:' + p.color + ';font-weight:800">' + p.name + '</span>'
        +   '<span style="color:var(--text-muted);font-size:.78rem;margin-left:.4rem">'
        +     (p.sd.phase === 2 ? '🛡️ Phase 2' : '🏃 Phase 1') + ' · streak ' + p.sd.streak
        +   '</span>'
        +   '<span style="margin-left:auto;color:var(--gold);font-weight:800;padding-right:.4rem">' + Math.round(p.sd.total) + ' pts</span>'
        +   '<span class="bd-toggle">▼</span>'
        + '</summary>'
        + '<div class="bd-inner"><table>'
        +   '<thead><tr><th>Month</th><th>Type</th><th>Points</th><th>Notes</th></tr></thead>'
        +   '<tbody>' + rows + '</tbody>'
        + '</table></div>'
        + '</details>';
    }).join('');
}

// ── Chart ────────────────────────────────────────────────────────────
function renderChart(participants, dates, scored) {
  if (_chart) { _chart.destroy(); _chart = null; }
  var ctx    = document.getElementById('weightChart').getContext('2d');
  var labels = dates.map(function(d) {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  });

  var datasets = [];
  var yOptions = {};
  var legendFilter;

  if (_chartMode === 'weight') {
    participants.forEach(function(p) {
      datasets.push({
        label: p.name,
        data: dates.map(function(d) { return weightOn(p, d); }),
        borderColor: p.color, backgroundColor: p.color + '22',
        borderWidth: 2.5, pointRadius: 5, pointHoverRadius: 7,
        tension: 0.3, fill: false, spanGaps: true,
      });
      datasets.push({
        label: p.name + ' goal',
        data: dates.map(function() { return p.goalWeight; }),
        borderColor: p.color, borderDash: [5, 5],
        borderWidth: 1.5, pointRadius: 0, fill: false, spanGaps: true,
      });
    });
    yOptions = { ticks: { color: '#7b7b9a', callback: function(v) { return v + ' kg'; } }, grid: { color: '#1e1e2e' } };
    legendFilter = function(item) { return !item.text.includes(' goal'); };

  } else if (_chartMode === 'pct') {
    participants.forEach(function(p) {
      datasets.push({
        label: p.name,
        data: dates.map(function(d) {
          var w = weightOn(p, d);
          return w !== null ? Math.round(progressPct(p.startWeight, p.goalWeight, w) * 10) / 10 : null;
        }),
        borderColor: p.color, backgroundColor: p.color + '22',
        borderWidth: 2.5, pointRadius: 5, pointHoverRadius: 7,
        tension: 0.3, fill: false, spanGaps: true,
      });
    });
    datasets.push({
      label: '100% Goal',
      data: dates.map(function() { return 100; }),
      borderColor: '#34d399', borderDash: [6, 4],
      borderWidth: 1.5, pointRadius: 0, fill: false, spanGaps: true,
    });
    yOptions = { min: 0, max: 110, ticks: { color: '#7b7b9a', callback: function(v) { return v + '%'; } }, grid: { color: '#1e1e2e' } };
    legendFilter = function(item) { return item.text !== '100% Goal'; };

  } else {
    // Points chart – cumulative
    var scoredMap = {};
    if (scored) scored.forEach(function(p) { scoredMap[p.id] = p; });
    participants.forEach(function(p) {
      var sp = scoredMap[p.id];
      datasets.push({
        label: p.name,
        data: dates.map(function(d) {
          return (sp && sp.sd.scoreByDate && sp.sd.scoreByDate[d] !== undefined) ? sp.sd.scoreByDate[d] : null;
        }),
        borderColor: p.color, backgroundColor: p.color + '18',
        borderWidth: 2.5, pointRadius: 5, pointHoverRadius: 7,
        tension: 0.3, fill: true, spanGaps: true,
      });
    });
    yOptions = { min: 0, ticks: { color: '#7b7b9a', callback: function(v) { return v + ' pts'; } }, grid: { color: '#1e1e2e' } };
    legendFilter = function() { return true; };
  }

  _chart = new Chart(ctx, {
    type: 'line',
    data: { labels: labels, datasets: datasets },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: '#7b7b9a', filter: legendFilter, usePointStyle: true } },
        tooltip: { backgroundColor: '#1a1a24', borderColor: '#2e2e40', borderWidth: 1, titleColor: '#e2e2f0', bodyColor: '#7b7b9a' },
      },
      scales: {
        x: { ticks: { color: '#7b7b9a' }, grid: { color: '#1e1e2e' } },
        y: yOptions,
      },
    },
  });
}

function switchChart(mode) {
  _chartMode = mode;
  document.querySelectorAll('.chart-tab').forEach(function(b) {
    b.classList.toggle('active', b.dataset.mode === mode);
  });
  var dates = allDates(_data.participants);
  var result = computeScores(_data);
  if (dates.length > 0) renderChart(_data.participants, dates, result.scored);
}

// ── History table ────────────────────────────────────────────────────
function renderHistory(participants, dates, monthlyWinners) {
  document.getElementById('hist-head').innerHTML = '<th>Date</th>'
    + participants.map(function(p) { return '<th style="color:' + p.color + '">' + p.name + '</th>'; }).join('')
    + '<th>Monthly Winner</th>';

  var rows = dates.slice().reverse().map(function(date) {
    var idx      = dates.indexOf(date);
    var prevDate = idx > 0 ? dates[idx - 1] : null;

    var cells = participants.map(function(p) {
      var w   = weightOn(p, date);
      var prv = prevDate ? weightOn(p, prevDate) : null;
      var tags = '';
      if (w !== null && prv !== null && prv - w < 0) tags += '<span class="tag tag-gain">+' + fmt(Math.abs(prv - w)) + '</span>';
      if (w !== null && w <= p.goalWeight) tags += '<span class="tag tag-goal">Goal ✓</span>';
      return '<td>' + (w !== null ? fmt(w) + ' kg' + tags : '–') + '</td>';
    }).join('');

    var winIds  = monthlyWinners[date] || [];
    var winHtml = winIds.length
      ? winIds.map(function(id) {
          var p = participants.find(function(x) { return x.id === id; });
          return p ? '<span style="color:' + p.color + '">🏆 ' + p.name + '</span>' : '';
        }).join(' ')
      : '–';

    return '<tr><td>' + longDate(date) + '</td>' + cells + '<td>' + winHtml + '</td></tr>';
  }).join('');

  document.getElementById('hist-body').innerHTML = rows
    || '<tr><td colspan="' + (participants.length + 2) + '" style="color:var(--text-muted);padding:1.5rem">No weigh-in data yet.</td></tr>';
}

function setLastUpdated(participants) {
  var all = participants.reduce(function(acc, p) { return acc.concat(p.entries.map(function(e) { return e.date; })); }, []).sort();
  if (!all.length) return;
  document.getElementById('last-updated').textContent = longDate(all[all.length - 1]);
}
