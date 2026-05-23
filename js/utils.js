'use strict';

function fmt(v, d) { return Number(v).toFixed(d !== undefined ? d : 1); }

function allDates(participants) {
  var s = new Set();
  participants.forEach(function(p) { p.entries.forEach(function(e) { s.add(e.date); }); });
  return Array.from(s).sort();
}

function weightOn(p, date) {
  var e = p.entries.find(function(x) { return x.date === date; });
  return e != null ? e.weight : null;
}

function sortedEntries(p) {
  return p.entries.slice().sort(function(a, b) { return a.date.localeCompare(b.date); });
}

function lastEntry(p) {
  var s = sortedEntries(p);
  return s.length ? s[s.length - 1] : null;
}

function progressPct(start, goal, current) {
  var total = start - goal;
  if (total <= 0) return 100;
  return Math.min(100, Math.max(0, ((start - current) / total) * 100));
}

function monthsBetween(d1, d2) {
  var pad = function(s) { return s.length === 7 ? s + '-01' : s; };
  var a = new Date(pad(d1));
  var b = new Date(pad(d2));
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

function shortDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function longDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
