'use strict';

// Depends on: config.js (RACERS, ANIMAL_QUOTES), utils.js (lastEntry, progressPct, fmt)
// Reads globals: _view (defined in main.js)

function renderRace(scored) {
  var el = document.getElementById('race-lanes');
  if (!el) return;

  el.innerHTML = scored
    .slice().sort(function(a, b) { return b.sd.total - a.sd.total; })
    .map(function(p) {
      var cur  = lastEntry(p);
      var curW = cur ? cur.weight : p.startWeight;
      var pct  = progressPct(p.startWeight, p.goalWeight, curW);
      var isP2 = p.sd.phase === 2;
      var r    = RACERS[p.id] || { row: 0 };

      // Sprite sheet: col = body stage (0=fat/1=medium/2=lean), row = animal
      // Col 2 offset adjusted for nose that extends across tile boundary
      var spriteCol = pct < 33 ? 0 : pct < 66 ? 1 : 2;
      // animals.png is 1528px wide; at background-size:300% it renders at 600px.
      // Column starts in rendered px: col0=0, col1=196 (500*600/1528), col2=393 (1000*600/1528)
      var COL_PX = ['0px', '-196px', '-393px'];
      var bpx = COL_PX[spriteCol];
      var bpy = (-r.row * 160) + 'px';

      var quoteIdx  = pct < 33 ? 0 : pct < 66 ? 1 : pct < 100 ? 2 : 3;
      var bodyStage = '\u201c' + ANIMAL_QUOTES[r.row][quoteIdx] + '\u201d';

      var kgLost  = p.startWeight - curW;
      var trackPos = isP2 ? 80 : Math.min(75, 17 + pct * 0.58);

      var spriteStyle = isP2
        ? 'background-image:url(\'animals_finished.png\');background-size:' + FINISHED_SPRITE.bgSize + ';background-position:' + FINISHED_SPRITE.positions[r.row]
        : 'background-position:' + bpx + ' ' + bpy;

      return '<div class="race-lane" style="--lane-color:' + p.color + '">'
        + '<div class="race-lane-top">'
        +   '<div class="race-animal-name" style="color:' + p.color + '">' + p.name + '</div>'
        +   '<div class="race-lane-stats">'
        +     (isP2
              ? '🛡️ Holding &middot; <strong style="color:#6ee7b7">' + p.sd.streak + '-month streak</strong>'
              : '<strong style="color:' + p.color + '">' + fmt(pct, 0) + '%</strong>'
                + ' &middot; ' + fmt(kgLost, 1) + ' kg lost')
        +   '</div>'
        + '</div>'
        + '<div class="race-track-outer">'
        +   '<div class="race-track-progress" style="width:' + pct + '%;background:' + p.color + '25"></div>'
        +   '<div class="race-track-grid"></div>'
        +   '<div class="racer-pos" style="left:calc(' + trackPos + '% - 100px)">'
        +     '<div class="racer-anim' + (isP2 ? ' hold' : '') + '">'
        +       '<div class="racer-sprite" style="' + spriteStyle + '"></div>'
        +     '</div>'
        +   '</div>'
        +   '<div class="race-finish-icon' + (isP2 ? ' done">✅' : '">') + '</div>'
        + '</div>'
        + '<div class="race-lane-bottom">'
        +   '<span class="race-pct-label" style="color:' + p.color + '">' + fmt(pct, 0) + '%</span>'
        +   '<span class="race-body-stage">' + bodyStage + '</span>'
        +   '<span class="race-weight-inf">' + curW + ' kg → ' + p.goalWeight + ' kg goal</span>'
        + '</div>'
        + '</div>';
    }).join('');
}

function switchView(view) {
  _view = view;
  document.querySelectorAll('.view-tab').forEach(function(b) {
    b.classList.toggle('active', b.dataset.view === view);
  });
  document.getElementById('stats-view').style.display = view === 'stats' ? '' : 'none';
  document.getElementById('s-race').style.display     = view === 'race'  ? '' : 'none';
}
