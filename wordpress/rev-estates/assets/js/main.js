/*
 * main.js — όλη η συμπεριφορά της σελίδας (animations, φόρμα, μενού).
 * Τρέχει μέσα σε μία ανώνυμη συνάρτηση (IIFE), ώστε οι μεταβλητές να μη "βγαίνουν" στο global scope.
 * Η σελίδα δουλεύει και χωρίς αυτό το αρχείο: όλα τα στοιχεία φαίνονται, απλώς χωρίς κινήσεις.
 */
(function () {
  var root = document.documentElement;

  // Βάζει την κλάση "js" στο <html>. Το CSS κρύβει τα στοιχεία των reveals ΜΟΝΟ όταν υπάρχει αυτή η κλάση,
  // ώστε χωρίς JavaScript να μένουν όλα ορατά.
  root.classList.add('js');

  // Αν ο χρήστης έχει ζητήσει λιγότερη κίνηση από το σύστημά του, παραλείπουμε τις βαριές κινήσεις.
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------
   * 1. ΕΙΣΑΓΩΓΗ: λογότυπο → η πόρτα μπαίνει και ανοίγει → φαίνεται η σελίδα.
   *    Η κίνηση γίνεται όλη με CSS· εδώ μόνο καθαρίζουμε όταν τελειώσει.
   *    Παίζει μόνο την 1η φορά ανά επίσκεψη (το θυμάται το sessionStorage).
   * --------------------------------------------------------------- */
  var intro = document.getElementById('intro');
  if (intro && root.classList.contains('intro-on')) {
    // Καθαρισμός: βγάζει την εισαγωγή από τη σελίδα και σημειώνει ότι εμφανίστηκε.
    var done = function () {
      root.classList.remove('intro-on');
      if (intro.parentNode) intro.parentNode.removeChild(intro);
      try { sessionStorage.setItem('rv-intro', '1'); } catch (e) {}
    };
    // Όταν τελειώσει το άνοιγμα της πόρτας (animation "doorOutL"/"doorOutR"), κάνουμε τον καθαρισμό.
    intro.addEventListener('animationend', function (e) {
      if (e.animationName === 'doorOutL' || e.animationName === 'doorOutR') done();
    });
    // Δίχτυ ασφαλείας: αν για κάποιο λόγο δεν ολοκληρωθεί, την αφαιρούμε στα 2,8 δευτερόλεπτα.
    setTimeout(done, 2800);
  } else if (intro && intro.parentNode) {
    // Δεν χρειάζεται εισαγωγή (π.χ. ξαναεπίσκεψη): αφαιρούμε το στοιχείο.
    intro.parentNode.removeChild(intro);
  }

  /* ---------------------------------------------------------------
   * 2. ΒΙΝΤΕΟ ΣΤΟ HEADER: φορτώνει μόνο όπου είναι κατάλληλο.
   *    Όχι σε reduced-motion, όχι με εξοικονόμηση δεδομένων, όχι σε μικρές οθόνες.
   * --------------------------------------------------------------- */
  var vid = document.getElementById('hero-video');
  if (vid) {
    var conn = navigator.connection || {};
    if (reduce || conn.saveData || window.innerWidth < 700) {
      vid.parentNode.removeChild(vid); // μένει το σκούρο κινούμενο φόντο
    } else {
      // Όταν το βίντεο είναι έτοιμο να παίξει, εμφανίζεται με απαλό fade (κλάση "is-ready").
      vid.addEventListener('canplay', function () { vid.classList.add('is-ready'); });
      // Μερικοί browsers μπλοκάρουν το autoplay: αγνοούμε σιωπηλά το σφάλμα.
      var p = vid.play && vid.play(); if (p && p.catch) p.catch(function () {});
    }
  }

  /* ---------------------------------------------------------------
   * 3. ΤΙΤΛΟΙ: σπάμε τους τίτλους h2 σε λέξεις, ώστε κάθε λέξη
   *    να "ανεβαίνει" μέσα από μάσκα ξεχωριστά (με μικρή καθυστέρηση).
   *    Ο τίτλος της σκηνής με το κλειδί εξαιρείται.
   * --------------------------------------------------------------- */
  document.querySelectorAll('main h2:not(.lock__title)').forEach(function (h) {
    var words = h.textContent.trim().split(/\s+/);
    h.textContent = '';
    words.forEach(function (w, i) {
      var m = document.createElement('span'); m.className = 'wm';                  // εξωτερικό: κόβει (μάσκα)
      var s = document.createElement('span'); s.className = 'wi';                  // εσωτερικό: η κινούμενη λέξη
      s.style.setProperty('--i', i);                                               // σειρά λέξης (για την καθυστέρηση)
      s.textContent = w; m.appendChild(s); h.appendChild(m);
      if (i < words.length - 1) h.appendChild(document.createTextNode(' '));       // κενό ανάμεσα στις λέξεις
    });
    h.classList.remove('reveal'); h.classList.add('stitle');
  });

  // Η φράση-γνώμη πελάτη: κάθε λέξη γίνεται <span class="w"> για να εμφανίζεται σταδιακά.
  var qp = document.querySelector('.quote p');
  if (qp) {
    var qw = qp.textContent.trim().split(/\s+/);
    qp.textContent = '';
    qw.forEach(function (w, i) {
      var s = document.createElement('span'); s.className = 'w'; s.style.setProperty('--i', i);
      s.textContent = w; qp.appendChild(s);
      if (i < qw.length - 1) qp.appendChild(document.createTextNode(' '));
    });
  }

  /* ---------------------------------------------------------------
   * 4. ΜΕΤΑΒΛΗΤΕΣ ΓΙΑ ΤΟ SCROLL
   * --------------------------------------------------------------- */
  var bar = document.querySelector('.progress');       // λεπτή γραμμή προόδου στο πάνω μέρος
  var head = document.getElementById('top-bar');       // η σταθερή επάνω μπάρα (header)
  var hero = document.getElementById('hero-inner');    // το περιεχόμενο του hero (τίτλος, κουμπί)
  var cue = document.getElementById('cue');            // η ένδειξη "Κύλιση"
  var medias = Array.prototype.slice.call(document.querySelectorAll('.media')); // όλες οι εικόνες/εικονογραφήσεις (για parallax)

  /* ---------------------------------------------------------------
   * 5. ΣΚΗΝΗ "ΚΛΕΙΔΙ ΚΑΙ ΚΛΕΙΔΑΡΙΑ": η θέση του scroll ελέγχει το κλειδί, το γύρισμα και τις πόρτες.
   * --------------------------------------------------------------- */
  var lock = document.getElementById('lock');
  var lockOn = !!lock && !reduce;                      // ενεργή μόνο αν υπάρχει η ενότητα και δεν έχει ζητηθεί reduced-motion

  // Βοηθητικές συναρτήσεις κίνησης:
  // seg(p,a,b): μετατρέπει την πρόοδο p (0..1) σε τοπική πρόοδο 0..1 μέσα στο διάστημα [a,b].
  function seg(p, a, b) { return Math.max(0, Math.min((p - a) / (b - a), 1)); }
  // Καμπύλες επιτάχυνσης (easing): ξεκινούν γρήγορα και επιβραδύνουν (outQuart/outCubic) ή και τα δύο (inOutCubic).
  function outQuart(t) { return 1 - Math.pow(1 - t, 4); }
  function outCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function inOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  // Υπολογίζει σε ποιο σημείο της σκηνής βρισκόμαστε (p) και γράφει CSS μεταβλητές,
  // τις οποίες χρησιμοποιεί το CSS για να μετακινήσει το κλειδί, να γυρίσει τον κύλινδρο και να ανοίξει τις πόρτες.
  function updateLock() {
    var r = lock.getBoundingClientRect();
    var total = lock.offsetHeight - window.innerHeight;                       // πόσο scroll διαρκεί η σκηνή
    var p = total > 0 ? Math.max(0, Math.min(-r.top / total, 1)) : 0;         // πρόοδος 0..1
    var st = lock.style;
    st.setProperty('--p', p.toFixed(4));                                      // συνολική πρόοδος
    st.setProperty('--s', (1 - outQuart(seg(p, 0, 0.28))).toFixed(4));        // 1→0: το κλειδί μπαίνει στην κλειδαριά
    st.setProperty('--r', (90 * inOutCubic(seg(p, 0.32, 0.52))).toFixed(3));  // 0→90°: γύρισμα κλειδιού
    st.setProperty('--c', Math.sin(Math.PI * seg(p, 0.52, 0.6)).toFixed(4));  // μικρό "κλικ" (παλμός)
    st.setProperty('--x', seg(p, 0.56, 0.68).toFixed(4));                     // σβήσιμο της κλειδαριάς
    st.setProperty('--o', inOutCubic(seg(p, 0.58, 0.92)).toFixed(4));         // άνοιγμα των δύο φύλλων
    st.setProperty('--m', outCubic(seg(p, 0.7, 0.95)).toFixed(4));            // εμφάνιση του μηνύματος από πίσω
    lock.classList.toggle('is-open', p >= 0.52);                              // χρωματίζει τον δακτύλιο όταν "ξεκλειδώσει"
  }
  if (lockOn) {
    lock.classList.add('lock--on');                // ενεργοποιεί το "κολλητό" ύψος της σκηνής στο CSS
    updateLock();
    window.addEventListener('resize', updateLock); // ξαναϋπολογισμός αν αλλάξει το μέγεθος παραθύρου
  }

  /* ---------------------------------------------------------------
   * 6. ΣΥΜΠΕΡΙΦΟΡΑ ΣΤΟ SCROLL
   *    Χρησιμοποιούμε requestAnimationFrame, ώστε να τρέχει το πολύ μία φορά ανά καρέ.
   * --------------------------------------------------------------- */
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || 0;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    // Γραμμή προόδου: γεμίζει από 0 έως 100% ανάλογα με το πόσο έχετε κατέβει.
    if (bar && max > 0) bar.style.transform = 'scaleX(' + Math.min(y / max, 1) + ')';

    // Η επάνω μπάρα παίρνει φόντο όταν κατεβείτε λίγο (κλάση "is-stuck").
    // Στις εσωτερικές σελίδες του WordPress έχει το χαρακτηριστικό data-solid και έχει πάντα φόντο.
    if (head) head.classList.toggle('is-stuck', y > 24 || head.hasAttribute('data-solid'));

    // Η ένδειξη "Κύλιση" κρύβεται μόλις αρχίσει η κύλιση.
    if (cue) cue.classList.toggle('is-gone', y > 60);

    // Το περιεχόμενο του hero κατεβαίνει ελαφρά και σβήνει καθώς κυλάτε.
    if (hero && !reduce) {
      var p = Math.min(y / (window.innerHeight * 0.7), 1);
      hero.style.transform = 'translateY(' + (p * 48).toFixed(1) + 'px)';
      hero.style.opacity = (1 - p * 0.85).toFixed(3);
    }

    // Ενημέρωση της σκηνής με το κλειδί (αν είναι ενεργή).
    if (lockOn) updateLock();

    // Parallax εικόνων: κάθε εικόνα μετατοπίζεται λίγο ανάλογα με το πού βρίσκεται στην οθόνη.
    medias.forEach(function (m) {
      var r = m.getBoundingClientRect();
      if (r.bottom < -50 || r.top > window.innerHeight + 50) return;  // αγνοούμε όσες δεν φαίνονται
      var t = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      m.style.setProperty('--py', (t * -14).toFixed(1) + 'px');
    });

    ticking = false;
  }

  // Ακούμε το scroll· ζητάμε ενημέρωση μία φορά ανά καρέ (passive = δεν μπλοκάρει την κύλιση).
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll(); // αρχική εκτέλεση

  /* ---------------------------------------------------------------
   * 7. REVEALS: τα στοιχεία εμφανίζονται με animation όταν μπουν στην οθόνη (μία φορά).
   *    Όταν ένα στοιχείο φαίνεται, του βάζουμε την κλάση "in" και το CSS κάνει το υπόλοιπο.
   * --------------------------------------------------------------- */
  var targets = document.querySelectorAll('.reveal, .media, .cmp, .stitle, .steps li, .qmark, .quote, .key');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    // Παλιός browser χωρίς IntersectionObserver: δείχνουμε τα πάντα αμέσως.
    targets.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------------------------------------------------------------
   * 8. ΜΕΝΟΥ: υπογραμμίζει τον σύνδεσμο της ενότητας που βλέπετε τώρα.
   * --------------------------------------------------------------- */
  var links = {};
  document.querySelectorAll('[data-nav]').forEach(function (a) { links[a.getAttribute('data-nav')] = a; });
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = links[en.target.id];
        if (a && en.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('is-current'); });
          a.classList.add('is-current');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' }); // θεωρείται "τρέχουσα" όταν περνά από τη μέση της οθόνης
    Object.keys(links).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) so.observe(s);
    });
  }

  /* ---------------------------------------------------------------
   * 9. SLIDER «ΠΡΙΝ / ΜΕΤΑ»: το κρυφό range input οδηγεί τη θέση (--p).
   *    Μία ήπια αρχική κίνηση δείχνει ότι σύρεται, μέχρι ο χρήστης να το αγγίξει.
   * --------------------------------------------------------------- */
  var cmp = document.getElementById('cmp');
  var range = document.getElementById('cmp-range');
  if (cmp && range) {
    var touched = false; // έγινε επαφή από τον χρήστη;
    var setP = function (v) { cmp.style.setProperty('--p', v + '%'); };
    range.addEventListener('input', function () { touched = true; setP(range.value); });
    if ('IntersectionObserver' in window && !reduce) {
      var co = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        co.disconnect();
        var t0 = null, from = 8, to = 50, dur = 1300; // από 8% έως 50% σε 1,3 δευτερόλεπτα
        setP(from); range.value = from;
        (function step(ts) {
          if (touched) return;                          // αν ο χρήστης το άγγιξε, σταματά η επίδειξη
          if (t0 === null) t0 = ts + 600;               // μικρή αναμονή πριν ξεκινήσει
          var k = Math.max(0, Math.min((ts - t0) / dur, 1));
          var e = 1 - Math.pow(1 - k, 4);               // easing
          var v = from + (to - from) * e;
          setP(v.toFixed(1)); range.value = v;
          if (k < 1) requestAnimationFrame(step);
        })(performance.now());
      }, { threshold: 0.5 });
      co.observe(cmp);
    }
  }

  /* ---------------------------------------------------------------
   * 10. ΣΥΧΝΕΣ ΕΡΩΤΗΣΕΙΣ (accordion): το κλικ ανοίγει/κλείνει κάθε απάντηση.
   *     Το CSS κάνει το animation, βασισμένο στο aria-expanded.
   * --------------------------------------------------------------- */
  document.querySelectorAll('.acc__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });

  /* ---------------------------------------------------------------
   * 11. ΦΟΡΜΑ ΕΠΙΚΟΙΝΩΝΙΑΣ: έλεγχος πεδίων και (προς το παρόν) προσομοίωση αποστολής.
   * --------------------------------------------------------------- */
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status'); // μήνυμα κατάστασης δίπλα στο κουμπί
  if (!form) return;

  // Κανόνες ελέγχου: id πεδίου, id του μηνύματος σφάλματος, και συνάρτηση που επιστρέφει true αν η τιμή είναι σωστή.
  var rules = [
    { id: 'f-name', err: 'e-name', test: function (v) { return v.trim().length > 1; } },                                  // όνομα: τουλάχιστον 2 χαρακτήρες
    { id: 'f-phone', err: 'e-phone', test: function (v) { return v.replace(/\D/g, '').length >= 8; } },                    // τηλέφωνο: τουλάχιστον 8 ψηφία
    { id: 'f-email', err: 'e-email', test: function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); } },        // email: προαιρετικό, αλλά αν υπάρχει να είναι σωστό
    { id: 'f-area', err: 'e-area', test: function (v) { return v.trim().length > 1; } }                                    // περιοχή: τουλάχιστον 2 χαρακτήρες
  ];

  // Δείχνει ή κρύβει το μήνυμα σφάλματος και ενημερώνει την προσβασιμότητα (aria).
  function setError(input, errEl, bad) {
    input.setAttribute('aria-invalid', bad ? 'true' : 'false');
    if (bad) input.setAttribute('aria-describedby', errEl.id); else input.removeAttribute('aria-describedby');
    errEl.hidden = !bad;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();                 // δεν στέλνουμε πραγματικά τη φόρμα προς το παρόν
    var first = null;                   // το πρώτο πεδίο με λάθος (για να του δώσουμε εστίαση)

    // Έλεγχος κάθε πεδίου με τους κανόνες.
    rules.forEach(function (r) {
      var input = document.getElementById(r.id);
      var bad = !r.test(input.value);
      setError(input, document.getElementById(r.err), bad);
      if (bad && !first) first = input;
    });

    // Έλεγχος του πλαισίου συγκατάθεσης (GDPR).
    var consent = document.getElementById('f-consent');
    var consentBad = !consent.checked;
    setError(consent, document.getElementById('e-consent'), consentBad);
    if (consentBad && !first) first = consent;

    // Αν υπάρχει λάθος: σταματάμε και πηγαίνουμε το δείκτη στο πρώτο λάθος πεδίο.
    if (first) {
      status.textContent = '';
      status.className = 'status bad';
      first.focus();
      return;
    }

    // Όλα σωστά: απενεργοποιούμε το κουμπί και δείχνουμε "Αποστολή…".
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    status.className = 'status';
    status.textContent = 'Αποστολή…';

    // Τελική ενέργεια μετά την αποστολή: ok = επιτυχία ή όχι, msg = μήνυμα προς τον επισκέπτη.
    var finish = function (ok, msg) {
      btn.disabled = false;
      if (ok) {
        form.reset();                                        // καθαρίζει τα πεδία
        status.className = 'status ok';
        status.textContent = msg || 'Λάβαμε το μήνυμά σας. Θα επικοινωνήσουμε σύντομα.';
        var key = document.getElementById('key');            // το κλειδί στην ενότητα Επικοινωνία "γυρίζει" ως επιβεβαίωση
        if (key) key.classList.add('turned');
      } else {
        status.className = 'status bad';
        status.textContent = msg || 'Κάτι πήγε στραβά. Δοκιμάστε ξανά σε λίγο.';
      }
    };

    // Στο WordPress το θέμα ορίζει το window.revEstates (με τη διεύθυνση admin-ajax.php): τότε η φόρμα στέλνεται πραγματικά.
    // Αλλιώς (π.χ. άνοιγμα του index.html τοπικά) προσομοιώνουμε επιτυχία μετά από 0,7 δευτερόλεπτα.
    var cfg = window.revEstates || null;
    if (cfg && cfg.ajaxUrl) {
      var data = new FormData(form);                         // όλα τα πεδία της φόρμας
      data.append('action', 'rev_contact');                  // το όνομα της ενέργειας στο functions.php
      fetch(cfg.ajaxUrl, { method: 'POST', body: data, credentials: 'same-origin' })
        .then(function (r) { return r.json(); })
        .then(function (j) { finish(!!j.success, j.data && j.data.message); })
        .catch(function () { finish(false); });
    } else {
      setTimeout(function () { finish(true); }, 700);
    }
  });
})();
