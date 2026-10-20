(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- intro: logo, then the sheet slides away (first visit per session) ---- */
  var intro = document.getElementById('intro');
  if (intro && root.classList.contains('intro-on')) {
    var done = function () {
      root.classList.remove('intro-on');
      if (intro.parentNode) intro.parentNode.removeChild(intro);
      try { sessionStorage.setItem('rv-intro', '1'); } catch (e) {}
    };
    intro.addEventListener('animationend', function (e) { if (e.animationName === 'introOut') done(); });
    setTimeout(function () { intro.classList.add('go'); }, 650);
    setTimeout(done, 2800);
  } else if (intro && intro.parentNode) {
    intro.parentNode.removeChild(intro);
  }

  /* ---- hero video: only where it is welcome (motion ok, not on small screens or data saver) ---- */
  var vid = document.getElementById('hero-video');
  if (vid) {
    var conn = navigator.connection || {};
    if (reduce || conn.saveData || window.innerWidth < 700) {
      vid.parentNode.removeChild(vid);
    } else {
      vid.addEventListener('canplay', function () { vid.classList.add('is-ready'); });
      var p = vid.play && vid.play(); if (p && p.catch) p.catch(function () {});
    }
  }

  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---- split titles into masked words, quote into fading words ---- */
  document.querySelectorAll('main h2:not(.lock__title)').forEach(function (h) {
    var words = h.textContent.trim().split(/\s+/);
    h.textContent = '';
    words.forEach(function (w, i) {
      var m = document.createElement('span'); m.className = 'wm';
      var s = document.createElement('span'); s.className = 'wi'; s.style.setProperty('--i', i);
      s.textContent = w; m.appendChild(s); h.appendChild(m);
      if (i < words.length - 1) h.appendChild(document.createTextNode(' '));
    });
    h.classList.remove('reveal'); h.classList.add('stitle');
  });
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

  /* ---- scroll: progress hairline, header state, hero drift ---- */
  var bar = document.querySelector('.progress');
  var head = document.getElementById('top-bar');
  var hero = document.getElementById('hero-inner');
  var cue = document.getElementById('cue');
  var art = document.getElementById('hero-art');
  var artKey = art ? art.querySelector('.art__key') : null;
  var mx = 0, my = 0, tx = 0, ty = 0, scrollY0 = 0, running = false;
  var medias = Array.prototype.slice.call(document.querySelectorAll('.media'));
  /* ---- key and lock scene: scroll position drives the key, the turn and the doors ---- */
  var lock = document.getElementById('lock');
  var lockOn = !!lock && !reduce;
  function seg(p, a, b) { return Math.max(0, Math.min((p - a) / (b - a), 1)); }
  function outQuart(t) { return 1 - Math.pow(1 - t, 4); }
  function outCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function inOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function updateLock() {
    var r = lock.getBoundingClientRect();
    var total = lock.offsetHeight - window.innerHeight;
    var p = total > 0 ? Math.max(0, Math.min(-r.top / total, 1)) : 0;
    var st = lock.style;
    st.setProperty('--p', p.toFixed(4));
    st.setProperty('--s', (1 - outQuart(seg(p, 0, 0.28))).toFixed(4));
    st.setProperty('--r', (90 * inOutCubic(seg(p, 0.32, 0.52))).toFixed(3));
    st.setProperty('--c', Math.sin(Math.PI * seg(p, 0.52, 0.6)).toFixed(4));
    st.setProperty('--x', seg(p, 0.56, 0.68).toFixed(4));
    st.setProperty('--o', inOutCubic(seg(p, 0.58, 0.92)).toFixed(4));
    st.setProperty('--m', outCubic(seg(p, 0.7, 0.95)).toFixed(4));
    lock.classList.toggle('is-open', p >= 0.52);
  }
  if (lockOn) {
    lock.classList.add('lock--on');
    updateLock();
    window.addEventListener('resize', updateLock);
  }

  var ticking = false;

  function onScroll() {
    var y = window.scrollY || 0;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar && max > 0) bar.style.transform = 'scaleX(' + Math.min(y / max, 1) + ')';
    if (head) head.classList.toggle('is-stuck', y > 24);
    if (cue) cue.classList.toggle('is-gone', y > 60);
    if (hero && !reduce) {
      var p = Math.min(y / (window.innerHeight * 0.7), 1);
      hero.style.transform = 'translateY(' + (p * 48).toFixed(1) + 'px)';
      hero.style.opacity = (1 - p * 0.85).toFixed(3);
    }
    scrollY0 = y;
    if (lockOn) updateLock();
    medias.forEach(function (m) {
      var r = m.getBoundingClientRect();
      if (r.bottom < -50 || r.top > window.innerHeight + 50) return;
      var t = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      m.style.setProperty('--py', (t * -14).toFixed(1) + 'px');
    });
    drawArt();
    ticking = false;
  }

  /* soft pointer follow on the hero line art (decorative only) */
  function drawArt() {
    if (!art || reduce) return;
    var p = Math.min(scrollY0 / (window.innerHeight * 0.9), 1);
    art.style.transform = 'translate3d(' + mx.toFixed(1) + 'px,' + (my + p * 70).toFixed(1) + 'px,0)';
    art.style.setProperty('--o', (1 - p * 0.9).toFixed(3));
    if (artKey) artKey.style.transform = 'translate3d(' + (mx * 0.9).toFixed(1) + 'px,' + (my * 0.9).toFixed(1) + 'px,0)';
  }
  function loop() {
    mx += (tx - mx) * 0.07; my += (ty - my) * 0.07;
    drawArt();
    if (Math.abs(tx - mx) > 0.1 || Math.abs(ty - my) > 0.1) requestAnimationFrame(loop); else running = false;
  }
  if (fine && !reduce && art) {
    window.addEventListener('pointermove', function (e) {
      tx = (e.clientX / window.innerWidth - 0.5) * 26;
      ty = (e.clientY / window.innerHeight - 0.5) * 18;
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---- reveals (once) ---- */
  var targets = document.querySelectorAll('.reveal, .media, .cmp, .stitle, .steps li, .qmark, .quote, .key');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- current section in the nav ---- */
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
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(links).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) so.observe(s);
    });
  }

  /* ---- before / after slider: native range drives it; one gentle demo sweep ---- */
  var cmp = document.getElementById('cmp');
  var range = document.getElementById('cmp-range');
  if (cmp && range) {
    var touched = false;
    var setP = function (v) { cmp.style.setProperty('--p', v + '%'); };
    range.addEventListener('input', function () { touched = true; setP(range.value); });
    if ('IntersectionObserver' in window && !reduce) {
      var co = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        co.disconnect();
        var t0 = null, from = 8, to = 50, dur = 1300;
        setP(from); range.value = from;
        (function step(ts) {
          if (touched) return;
          if (t0 === null) t0 = ts + 600;
          var k = Math.max(0, Math.min((ts - t0) / dur, 1));
          var e = 1 - Math.pow(1 - k, 4);
          var v = from + (to - from) * e;
          setP(v.toFixed(1)); range.value = v;
          if (k < 1) requestAnimationFrame(step);
        })(performance.now());
      }, { threshold: 0.5 });
      co.observe(cmp);
    }
  }

  /* ---- accordion ---- */
  document.querySelectorAll('.acc__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });

  /* ---- form ---- */
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  if (!form) return;

  var rules = [
    { id: 'f-name', err: 'e-name', test: function (v) { return v.trim().length > 1; } },
    { id: 'f-phone', err: 'e-phone', test: function (v) { return v.replace(/\D/g, '').length >= 8; } },
    { id: 'f-email', err: 'e-email', test: function (v) { return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); } },
    { id: 'f-area', err: 'e-area', test: function (v) { return v.trim().length > 1; } }
  ];

  function setError(input, errEl, bad) {
    input.setAttribute('aria-invalid', bad ? 'true' : 'false');
    if (bad) input.setAttribute('aria-describedby', errEl.id); else input.removeAttribute('aria-describedby');
    errEl.hidden = !bad;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var first = null;

    rules.forEach(function (r) {
      var input = document.getElementById(r.id);
      var bad = !r.test(input.value);
      setError(input, document.getElementById(r.err), bad);
      if (bad && !first) first = input;
    });

    var consent = document.getElementById('f-consent');
    var consentBad = !consent.checked;
    setError(consent, document.getElementById('e-consent'), consentBad);
    if (consentBad && !first) first = consent;

    if (first) {
      status.textContent = '';
      status.className = 'status bad';
      first.focus();
      return;
    }

    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    status.className = 'status';
    status.textContent = 'Αποστολή…';

    // TODO: replace with the real WordPress form handler (e.g. Contact Form 7 / admin-ajax).
    setTimeout(function () {
      btn.disabled = false;
      form.reset();
      status.className = 'status ok';
      status.textContent = 'Λάβαμε το μήνυμά σας. Θα επικοινωνήσουμε σύντομα.';
      var key = document.getElementById('key'); if (key) key.classList.add('turned');
    }, 700);
  });
})();
