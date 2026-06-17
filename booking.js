/* ════════════════════════════════════════════════════════════════════
   GRACEWOOD ACRES — Square booking wiring
   ────────────────────────────────────────────────────────────────────
   ONE-TIME SETUP (no coding needed beyond pasting links):

   1. In Square → Appointments → Online Booking, click "Get booking link"
      and copy your booking site URL. Paste it as BASE below, between the
      quotes. That's the only required step — every "Book"/"Tour"/"Eval"
      button on the site will start opening your Square booking page.

   2. (Optional) To send people straight to a specific service, open that
      service in Square's booking site, copy its link, and paste it next to
      the matching key in SERVICES. Anything left "" just uses BASE.

   Until BASE is filled in, every booking button falls back to the
   "Send a note" contact form so nothing is ever a dead end.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  var BASE = ""; // e.g. "https://book.squareup.com/appointments/abc123/location/XYZ"

  var SERVICES = {
    "tour":          "", // Free farm tour (30 min)
    "lesson":        "", // Private lesson — $60
    "4pack":         "", // Lesson 4-pack — $220
    "youth-day":     "", // Youth horsemanship day — $75 / $275 4-card
    "day-camp":      "", // Summer day camp — $295/week
    "homeschool":    "", // Homeschool horsemanship — $375/semester
    "training-eval": "", // Free training evaluation
    "pre-purchase":  "", // Pre-purchase evaluation — $150
    "open-ride":     "", // Thursday open ride night — $20
    "clinic":        "", // Problem-horse clinic — $125
    "birthday":      ""  // Birthday party — $300
  };

  var FALLBACK = "visit.html#form"; // used until Square BASE is set

  function urlFor(key) {
    if (SERVICES[key]) return SERVICES[key];
    if (BASE) return BASE;
    return null;
  }

  function wire() {
    document.querySelectorAll('[data-book]').forEach(function (el) {
      var u = urlFor(el.getAttribute('data-book'));
      if (u) {
        el.setAttribute('href', u);
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener');
      } else {
        el.setAttribute('href', FALLBACK);
        el.removeAttribute('target');
      }
    });
  }

  if (document.readyState !== 'loading') wire();
  else document.addEventListener('DOMContentLoaded', wire);
})();
