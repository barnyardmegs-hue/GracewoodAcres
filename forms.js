/* ════════════════════════════════════════════════════════════════════
   GRACEWOOD ACRES — shared form logic
   • signature pads (draw with finger/mouse) → saved into a hidden field
   • auto-fills today's date
   • submits to Netlify Forms (emails Meg + stored/backed-up in dashboard)
   • shows a success panel + a "save your copy" (print / Save-as-PDF) button
   No build step, no dependencies.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ---------- today's date into any [data-today] field ---------- */
  function fillToday() {
    var d = new Date();
    var iso = d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
    document.querySelectorAll('[data-today]').forEach(function (el) {
      if (!el.value) el.value = iso;
    });
  }

  /* ---------- signature pads ---------- */
  function initSignaturePads() {
    document.querySelectorAll('.sig-pad').forEach(function (pad) {
      var canvas = pad.querySelector('canvas');
      var hidden = document.getElementById(pad.dataset.target);
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      var ratio = Math.max(window.devicePixelRatio || 1, 1);

      function size() {
        var r = canvas.getBoundingClientRect();
        if (!r.width) return;
        canvas.width = r.width * ratio;
        canvas.height = r.height * ratio;
        ctx.scale(ratio, ratio);
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#0e0d0b';
      }
      size();
      window.addEventListener('resize', function () {
        // preserve drawing across resize
        var data = pad.dataset.drawn ? canvas.toDataURL() : null;
        size();
        if (data) {
          var img = new Image();
          img.onload = function () {
            ctx.drawImage(img, 0, 0, canvas.width / ratio, canvas.height / ratio);
          };
          img.src = data;
        }
      });

      var drawing = false, last = null;
      function pos(e) {
        var r = canvas.getBoundingClientRect();
        var t = e.touches ? e.touches[0] : e;
        return { x: t.clientX - r.left, y: t.clientY - r.top };
      }
      function start(e) { e.preventDefault(); drawing = true; last = pos(e); }
      function move(e) {
        if (!drawing) return;
        e.preventDefault();
        var p = pos(e);
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        last = p;
        if (!pad.dataset.drawn) pad.dataset.drawn = '1';
      }
      function end() {
        if (!drawing) return;
        drawing = false;
        if (hidden && pad.dataset.drawn) hidden.value = canvas.toDataURL('image/png');
      }
      canvas.addEventListener('mousedown', start);
      canvas.addEventListener('mousemove', move);
      window.addEventListener('mouseup', end);
      canvas.addEventListener('touchstart', start, { passive: false });
      canvas.addEventListener('touchmove', move, { passive: false });
      canvas.addEventListener('touchend', end);

      var clear = pad.parentNode.querySelector('.sig-clear');
      if (clear) clear.addEventListener('click', function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        delete pad.dataset.drawn;
        if (hidden) hidden.value = '';
      });
    });
  }

  /* ---------- checkbox styled-state mirror ---------- */
  function initChecks() {
    document.querySelectorAll('.legal-check input[type="checkbox"]').forEach(function (cb) {
      function sync() { cb.closest('.legal-check').dataset.checked = cb.checked ? '1' : '0'; }
      cb.addEventListener('change', sync); sync();
    });
  }

  /* ---------- submit ---------- */
  function initForms() {
    document.querySelectorAll('form.gw-form').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        var note = form.querySelector('.form-submit-note');
        // commit signatures to hidden fields one more time
        form.querySelectorAll('.sig-pad').forEach(function (pad) {
          var c = pad.querySelector('canvas');
          var h = document.getElementById(pad.dataset.target);
          if (c && h && pad.dataset.drawn) h.value = c.toDataURL('image/png');
        });
        // record a timestamp
        var ts = form.querySelector('[name="submitted_at"]');
        if (ts) ts.value = new Date().toString();

        if (!window.fetch) return true; // let it post normally on ancient browsers
        e.preventDefault();

        var btn = form.querySelector('button[type="submit"]');
        if (note) { note.classList.remove('err'); note.textContent = 'Sending…'; }
        if (btn) btn.disabled = true;

        var data = new URLSearchParams(new FormData(form)).toString();
        fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: data
        }).then(function () {
          showDone(form);
        }).catch(function () {
          if (note) {
            note.classList.add('err');
            note.textContent = 'That didn’t send. Call or text (423) 607-5656 and we’ll sort it out.';
          }
          if (btn) btn.disabled = false;
        });
        return false;
      });
    });
  }

  function showDone(form) {
    var done = document.getElementById(form.dataset.done || 'form-done');
    form.style.display = 'none';
    if (done) {
      done.classList.add('show');
      var email = form.querySelector('input[type="email"]');
      var span = done.querySelector('[data-signer-email]');
      if (span && email && email.value) span.textContent = email.value;
      window.scrollTo({ top: done.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
    }
  }

  // expose for the print button
  window.gwPrintCopy = function () { window.print(); };

  function boot() { fillToday(); initSignaturePads(); initChecks(); initForms(); }
  if (document.readyState !== 'loading') boot();
  else document.addEventListener('DOMContentLoaded', boot);
})();
