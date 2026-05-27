(function () {
  'use strict';

  /* === НАСТРОЙКИ === */
  var REC_ID = '123456789';           /* ID Zero Block без #rec */
  var SHOW_DURATION = 5000;           /* Сколько висит плашка, мс */
  var ANIMATION_MS = 450;             /* Длительность анимации (как в CSS) */
  var CLOSE_SELECTOR = '.top-banner-close'; /* Класс на крестике в Zero Block */

  var rec = document.getElementById('rec' + REC_ID);
  if (!rec) return;

  var hideTimer = null;
  var isHidden = false;

  function hideBanner() {
    if (isHidden) return;
    isHidden = true;

    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }

    rec.classList.remove('top-banner--visible');
    rec.classList.add('top-banner--hiding');
  }

  function showBanner() {
    rec.classList.add('top-banner--visible');

    hideTimer = setTimeout(hideBanner, SHOW_DURATION);
  }

  /* Показ после загрузки страницы */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showBanner);
  } else {
    showBanner();
  }

  /* Закрытие только по крестику */
  var closeBtn = rec.querySelector(CLOSE_SELECTOR);
  if (closeBtn) {
    closeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      hideBanner();
    });

    /* Если крестик внутри ссылки — блокируем переход */
    closeBtn.addEventListener('mousedown', function (e) {
      e.preventDefault();
      e.stopPropagation();
    });
  }
})();
