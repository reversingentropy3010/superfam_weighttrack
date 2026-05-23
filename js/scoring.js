'use strict';

// Depends on: utils.js (allDates, sortedEntries, lastEntry, progressPct, monthsBetween, fmt, shortDate)
// Depends on: config.js (SC)

function computeScores(data) {
  var participants = data.participants;
  var deadline     = data.deadline;
  var dates        = allDates(participants);
  var challengeStart = dates.length ? dates[0] : deadline;
  var totalMonths  = Math.max(1, monthsBetween(challengeStart, deadline));

  var scored = participants.map(function(p) {
    var entries       = sortedEntries(p);
    var events        = [];
    var monthlyPerf   = {};
    var total         = 0;
    var streak        = 0;
    var phase         = 1;
    var goalAchievedDate = null;
    var totalToLose   = Math.max(0.1, p.startWeight - p.goalWeight);

    for (var i = 1; i < entries.length; i++) {
      var prev   = entries[i - 1];
      var curr   = entries[i];
      var kgLost = prev.weight - curr.weight;

      if (phase === 1) {
        if (kgLost > 0) {
          var pts = Math.round((kgLost / totalToLose) * SC.LOSS_PCT_PTS * 10) / 10;
          total  += pts;
          streak++;
          var pctProgress = fmt((kgLost / totalToLose) * 100);
          events.push({ date: curr.date, type: 'loss', pts: pts, note: 'Lost ' + fmt(kgLost) + ' kg (' + pctProgress + '% of goal)' });
          monthlyPerf[curr.date] = pts;
        } else {
          streak = 0;
          var note = kgLost < 0 ? 'Gained ' + fmt(Math.abs(kgLost)) + ' kg' : 'No change';
          events.push({ date: curr.date, type: 'loss', pts: 0, note: note });
          monthlyPerf[curr.date] = 0;
        }

        if (curr.weight <= p.goalWeight && goalAchievedDate === null) {
          goalAchievedDate = curr.date;
          var monthsLeft   = Math.max(0, monthsBetween(curr.date, deadline));
          var earlyFrac    = monthsLeft / totalMonths;
          var goalBonus    = Math.round(SC.GOAL_BASE + earlyFrac * SC.GOAL_EARLY_MAX);
          total += goalBonus;
          events.push({
            date: curr.date, type: 'goal', pts: goalBonus,
            note: 'Goal reached! (' + monthsLeft + ' months remaining = ' + goalBonus + ' pts)',
          });
          phase  = 2;
          streak = 1;
        }

      } else {
        if (curr.weight <= p.goalWeight) {
          var mpts = SC.MAINTAIN_BASE;
          total  += mpts;
          streak++;
          events.push({ date: curr.date, type: 'maintain', pts: mpts, note: 'Maintained goal (' + mpts + ' pts)' });
          monthlyPerf[curr.date] = mpts;
          SC.STREAK_MILESTONES.forEach(function(m) {
            if (streak === m[0]) {
              total += m[1];
              events.push({ date: curr.date, type: 'streak', pts: m[1], note: m[0] + '-month hold streak 🛡️ (+' + m[1] + ' pts)' });
            }
          });
        } else {
          var kgOver = curr.weight - p.goalWeight;
          streak = 0;
          events.push({ date: curr.date, type: 'maintain', pts: 0, note: fmt(kgOver) + ' kg above goal – no pts' });
          monthlyPerf[curr.date] = 0;
        }
      }
    }

    return Object.assign({}, p, { sd: { total: total, events: events, monthlyPerf: monthlyPerf, phase: phase, streak: streak, goalAchievedDate: goalAchievedDate } });
  });

  // Monthly rankings (tiered: 1st / 2nd / 3rd)
  var monthlyWinners = {};
  for (var di = 1; di < dates.length; di++) {
    var date    = dates[di];
    // Only Phase 1 participants compete for monthly medals
    var monthly = scored
      .filter(function(p) {
        return p.sd.monthlyPerf[date] > 0
          && (!p.sd.goalAchievedDate || p.sd.goalAchievedDate >= date);
      })
      .slice()
      .sort(function(a, b) { return b.sd.monthlyPerf[date] - a.sd.monthlyPerf[date]; });
    // Need at least 2 Phase 1 racers for medals to mean anything
    if (monthly.length < 2) continue;

    // History table shows 1st-place finisher(s)
    var topPts = monthly[0].sd.monthlyPerf[date];
    monthlyWinners[date] = monthly
      .filter(function(p) { return p.sd.monthlyPerf[date] === topPts; })
      .map(function(p) { return p.id; });

    var rankLabels = ['🥇 1st', '🥈 2nd', '🥉 3rd'];
    var currentRank = 0;
    monthly.forEach(function(p, idx) {
      // Advance rank on a new (lower) score tier (standard competition ranking)
      if (idx > 0 && p.sd.monthlyPerf[date] < monthly[idx - 1].sd.monthlyPerf[date]) {
        currentRank = idx;
      }
      var rankPts = currentRank < SC.MONTHLY_RANKS.length ? SC.MONTHLY_RANKS[currentRank] : 0;
      if (rankPts > 0) {
        p.sd.total += rankPts;
        p.sd.events.push({ date: date, type: 'win', pts: rankPts, note: 'Monthly ' + rankLabels[currentRank] + ' (+' + rankPts + ' pts)' });
      }
    });
  }

  scored.forEach(function(p) {
    p.sd.events.sort(function(a, b) { return a.date.localeCompare(b.date); });
  });

  // Compute cumulative score by date for points chart
  var allDts = allDates(participants);
  scored.forEach(function(p) {
    var cum = 0;
    p.sd.scoreByDate = {};
    allDts.forEach(function(d) {
      p.sd.events.forEach(function(ev) { if (ev.date === d) cum += ev.pts; });
      p.sd.scoreByDate[d] = cum;
    });
  });

  return { scored: scored, monthlyWinners: monthlyWinners };
}
