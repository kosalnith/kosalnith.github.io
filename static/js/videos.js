/* ===================================================
   FEATURED VIDEOS — 3-visible carousel (center dominant)
   Side cards peek ~15vw. Buttons at center card seams.
   =================================================== */
(function () {
  'use strict';

  var wrapper    = document.getElementById('knCarouselWrapper');
  var track      = document.getElementById('knCarouselTrack');
  var overlay    = document.getElementById('knModalOverlay');
  var iframe     = document.getElementById('knModalIframe');
  var closeBtn   = document.getElementById('knModalClose');
  var modalTitle = document.getElementById('knModalTitle');
  var modalDesc  = document.getElementById('knModalDesc');
  var prevBtn    = document.querySelector('.kn-carousel-prev');
  var nextBtn    = document.querySelector('.kn-carousel-next');

  if (!track || !wrapper) return;

  var cards = Array.from(track.querySelectorAll('.kn-video-card'));
  var total = cards.length;
  var step  = 0;

  /* Card = 70vw, gap = 1.5rem.
     Side peek = (100vw - 70vw - 2×gap) / 2
     Start offset = side-peek + gap  (so first card is centered)          */
  function getGap() {
    var g = parseFloat(getComputedStyle(track).gap);
    return isNaN(g) ? 24 : g;
  }

  function cardW() {
    /* Read actual rendered card width */
    return cards.length ? cards[0].offsetWidth : window.innerWidth * 0.70;
  }

  function sidePeek() {
    return (window.innerWidth - cardW() - 2 * getGap()) / 2;
  }

  function startOffset() {
    /* How far left the track must shift so card[0] is centered */
    return -(sidePeek() + getGap());
  }

  function stepSize() {
    return cardW() + getGap();
  }

  /* ---- Render position ---- */
  function goTo(index, animate) {
    step = Math.max(0, Math.min(index, total - 1));

    if (animate) {
      // Apply will-change only for the duration of the animation
      track.style.willChange = 'transform';
      track.addEventListener('transitionend', function onEnd() {
        track.style.willChange = '';
        track.removeEventListener('transitionend', onEnd);
      });
    } else {
      track.style.transition = 'none';
    }

    var offset = startOffset() - step * stepSize();
    track.style.transform = 'translateX(' + offset + 'px)';

    if (!animate) {
      void track.offsetWidth;   /* force reflow */
      track.style.transition = '';
    }

    if (prevBtn) prevBtn.disabled = (step === 0);
    if (nextBtn) nextBtn.disabled = (step === total - 1);
  }

  /* ---- Nav ---- */
  if (prevBtn) prevBtn.addEventListener('click', function () { goTo(step - 1, true); });
  if (nextBtn) nextBtn.addEventListener('click', function () { goTo(step + 1, true); });

  /* ---- Keyboard ---- */
  document.addEventListener('keydown', function (e) {
    if (overlay && overlay.classList.contains('is-open')) return;
    if (e.key === 'ArrowLeft')  goTo(step - 1, true);
    if (e.key === 'ArrowRight') goTo(step + 1, true);
  });

  /* ---- Touch swipe ---- */
  var txStart = 0;
  wrapper.addEventListener('touchstart', function (e) {
    txStart = e.touches[0].clientX;
  }, { passive: true });
  wrapper.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - txStart;
    if (Math.abs(dx) > 40) goTo(dx < 0 ? step + 1 : step - 1, true);
  }, { passive: true });

  /* ---- Lightbox ---- */
  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      var videoId = card.dataset.videoId || '';
      if (!videoId || videoId.indexOf('VIDEO_ID') === 0) {
        alert('Replace VIDEO_ID_1 … VIDEO_ID_8 with real YouTube video IDs in index.html');
        return;
      }
      iframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0';
      if (modalTitle) modalTitle.textContent = card.dataset.title || '';
      if (modalDesc)  modalDesc.textContent  = card.dataset.desc  || '';
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    overlay.classList.remove('is-open');
    iframe.src = '';
    document.body.style.overflow = '';
  }
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (overlay)  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  /* ---- Resize: use ResizeObserver — fires only when element size actually changes ---- */
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(function () { goTo(step, false); }).observe(wrapper);
  } else {
    // Fallback for very old browsers
    var rTimer;
    window.addEventListener('resize', function () {
      clearTimeout(rTimer);
      rTimer = setTimeout(function () { goTo(step, false); }, 80);
    });
  }

  /* ---- Init ---- */
  goTo(0, false);

})();
