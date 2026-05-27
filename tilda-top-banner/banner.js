(function () {
  'use strict';

  /* === НАСТРОЙКИ === */
  var REC_ID = '123456789';
  var SHOW_DURATION = 5000;
  var CLOSE_SELECTOR = '.top-banner-close';

  function initTopBanner() {
    var rec = document.getElementById('rec' + REC_ID);
    if (!rec || rec.getAttribute('data-top-banner-ready') === '1') return;
    rec.setAttribute('data-top-banner-ready', '1');

    document.body.appendChild(rec);

    rec.querySelectorAll('.t-animate').forEach(function (el) {
      el.classList.remove('t-animate');
    });

    var hideTimer = null;
    var isHidden = false;

    function hideBanner() {
      if (isHidden) return;
      isHidden = true;
      if (hideTimer) clearTimeout(hideTimer);
      rec.classList.remove('top-banner--visible');
      rec.classList.add('top-banner--hiding');
    }

    function showBanner() {
      rec.classList.add('top-banner--visible');
      hideTimer = setTimeout(hideBanner, SHOW_DURATION);
    }

    showBanner();

    var closeEl = rec.querySelector(CLOSE_SELECTOR);
    if (closeEl) {
      var closeLink = closeEl.tagName === 'A' ? closeEl : closeEl.querySelector('a');
      if (closeLink) {
        closeLink.removeAttribute('href');
        closeLink.removeAttribute('target');
      }

      closeEl.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        hideBanner();
      }, true);
    }
  }

  if (typeof window.t_onReady === 'function') {
    window.t_onReady(function () {
      setTimeout(initTopBanner, 400);
    });
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(initTopBanner, 400);
    });
  } else {
    setTimeout(initTopBanner, 400);
  }
})();
