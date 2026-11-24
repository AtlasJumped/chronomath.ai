/* Shared behavior: menu, map filter, open-problem filter, tracker. No dependencies. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* menu */
  var menu = $('.menu'), nav = $('#nav');
  if (menu && nav) {
    menu.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  $$('.grpbtn').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = b.parentNode.classList.toggle('open');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  document.addEventListener('click', function () {
    $$('.grp.open').forEach(function (g) {
      g.classList.remove('open');
      $('.grpbtn', g).setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    $$('.grp.open').forEach(function (g) { g.classList.remove('open'); });
    if (nav && nav.classList.contains('open')) { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.focus(); }
  });

  /* the map: number the steps, count the colors, filter by color */
  var steps = $$('.step');
  if (steps.length) {
    var kinds = ['sure', 'idea', 'ai', 'guess', 'wall'], counts = {};
    kinds.forEach(function (k) { counts[k] = 0; });
    steps.forEach(function (s, i) {
      var k = kinds.filter(function (x) { return s.classList.contains(x); })[0];
      counts[k] += 1;
      s.dataset.kind = k;
      $('.dot', s).textContent = i + 1;
    });
    var bar = $('#mapbar');
    if (bar) {
      kinds.forEach(function (k) {
        var i = document.createElement('i');
        i.className = k;
        i.style.width = (100 * counts[k] / steps.length) + '%';
        bar.appendChild(i);
      });
    }
    $$('.legend button').forEach(function (b) {
      var k = b.dataset.kind, c = $('.n', b);
      if (c) c.textContent = counts[k] + (counts[k] === 1 ? ' step' : ' steps');
      b.addEventListener('click', function () {
        var on = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        steps.forEach(function (s) { if (s.dataset.kind === k) s.hidden = !on; });
      });
    });
  }

  /* open problems: filter by status */
  var chips = $$('.chip[data-status]');
  if (chips.length) {
    var probs = $$('.prob');
    chips.forEach(function (c) {
      var n = c.dataset.status === 'all' ? probs.length : probs.filter(function (p) { return p.dataset.status === c.dataset.status; }).length;
      c.textContent += ' (' + n + ')';
      c.addEventListener('click', function () {
        chips.forEach(function (x) { x.setAttribute('aria-pressed', x === c ? 'true' : 'false'); });
        probs.forEach(function (p) { p.hidden = c.dataset.status !== 'all' && p.dataset.status !== c.dataset.status; });
      });
    });
  }

  /* tracker */
  var tk = $('#tk');
  if (tk && window.TRACKER_ROWS) {
    var KEY = 'hmr-tracker-drafts-v1';
    var COLS = [['hmr', 'HMR'], ['math', 'Math'], ['physics', 'Physics']];
    var LABEL = { sourced: 'sourced', derived: 'derived', conjecture: 'conjecture', empty: 'empty' };
    var GROUP = { science: 'From science', hmr: 'From HMR', one: 'One column only', draft: 'Your draft' };
    var store = {
      get: function () { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } },
      set: function (v) { try { localStorage.setItem(KEY, JSON.stringify(v)); return true; } catch (e) { return false; } }
    };
    var fQ = $('#f-q'), fGroup = $('#f-group'), fCol = $('#f-col'), fStatus = $('#f-status'), count = $('#tk-count');
    var qs = new URLSearchParams(location.search);
    if (qs.get('col') && fCol) { fCol.value = qs.get('col'); }
    if (qs.get('status') && fStatus) { fStatus.value = qs.get('status'); }

    var el = function (tag, cls, text) {
      var n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text != null) n.textContent = text;
      return n;
    };
    var allRows = function () {
      var d = store.get().map(function (r) { r.group = 'draft'; return r; });
      return d.concat(window.TRACKER_ROWS);
    };
    var matches = function (r) {
      var g = fGroup.value, c = fCol.value, s = fStatus.value, q = fQ.value.trim().toLowerCase();
      if (g !== 'all' && r.group !== g) return false;
      var cols = c === 'all' ? ['hmr', 'math', 'physics'] : [c];
      if (s !== 'all' && !cols.some(function (k) { return r[k].s === s; })) return false;
      if (c !== 'all' && s === 'all' && r[c].s === 'empty') return false;
      if (q) {
        var hay = (r.title + ' ' + r.hmr.t + ' ' + r.math.t + ' ' + r.physics.t).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    };
    var render = function () {
      var rows = allRows().filter(matches);
      tk.textContent = '';
      rows.forEach(function (r) {
        var row = el('article', 'row');
        var head = el('header');
        head.appendChild(el('b', '', r.title));
        var right = el('span', 'src', GROUP[r.group] || '');
        if (r.group === 'draft') {
          var del = el('button', 'btn ghost sm', 'Delete draft');
          del.type = 'button';
          del.style.marginLeft = '10px';
          del.addEventListener('click', function () {
            store.set(store.get().filter(function (x) { return x.id !== r.id; }));
            render();
          });
          right.appendChild(del);
        }
        head.appendChild(right);
        row.appendChild(head);
        var cells = el('div', 'cells');
        COLS.forEach(function (c) {
          var d = r[c[0]];
          var cell = el('div', 'cell s-' + d.s);
          cell.appendChild(el('div', 'col', c[1]));
          var st = el('div', 'st');
          st.appendChild(el('span', 'tag', LABEL[d.s]));
          cell.appendChild(st);
          cell.appendChild(el('div', '', d.t || (d.s === 'empty' ? 'Nothing here yet.' : '')));
          if (d.ref) {
            var ref = el('span', 'ref');
            if (d.url) {
              var a = el('a', '', d.ref);
              a.href = d.url;
              ref.appendChild(a);
            } else { ref.textContent = d.ref; }
            cell.appendChild(ref);
          }
          cells.appendChild(cell);
        });
        row.appendChild(cells);
        tk.appendChild(row);
      });
      if (!rows.length) {
        var e = el('div', 'empty-state', 'No rows match these filters. ');
        var b = el('button', 'btn ghost sm', 'Clear filters');
        b.type = 'button';
        b.addEventListener('click', function () { fQ.value = ''; fGroup.value = fCol.value = fStatus.value = 'all'; render(); });
        e.appendChild(b);
        tk.appendChild(e);
      }
      var total = allRows();
      var tally = { sourced: 0, derived: 0, conjecture: 0, empty: 0 };
      total.forEach(function (r) { ['hmr', 'math', 'physics'].forEach(function (k) { tally[r[k].s] += 1; }); });
      count.textContent = 'Showing ' + rows.length + ' of ' + total.length + ' rows. Cells: ' + tally.sourced + ' sourced, ' +
        tally.derived + ' derived, ' + tally.conjecture + ' conjecture, ' + tally.empty + ' empty.';
    };
    [fQ, fGroup, fCol, fStatus].forEach(function (f) { f.addEventListener('input', render); });

    var form = $('#draft');
    if (form) {
      var msg = $('#draft-msg');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var v = function (n) { return form.elements[n].value.trim(); };
        if (!v('title')) { msg.textContent = 'Give the row a name so it can be found again.'; form.elements.title.focus(); return; }
        var cell = function (k) { var t = v(k), s = form.elements[k + '-s'].value; return { t: t, s: t ? s : 'empty' }; };
        var row = { id: 'd' + Date.now(), title: v('title'), hmr: cell('hmr'), math: cell('math'), physics: cell('physics') };
        var list = store.get();
        list.unshift(row);
        if (store.set(list)) {
          msg.textContent = 'Saved in this browser only. It is at the top of the tracker.';
          form.reset();
          render();
        } else {
          msg.textContent = 'This browser would not save the draft. Copy your text before leaving the page.';
        }
      });
      var exp = $('#draft-export');
      if (exp) {
        exp.addEventListener('click', function () {
          var out = $('#draft-out');
          $('#draft-outwrap').hidden = false;
          out.value = JSON.stringify(store.get(), null, 2);
          out.focus();
          out.select();
        });
      }
    }
    render();
  }
})();
