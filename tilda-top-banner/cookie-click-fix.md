<!-- Патч для блока T123 со скриптом cookie (.cookieBanner) -->
<!-- Замените функцию handleGlobalClick в существующем cookie-скрипте на эту версию: -->

<script>
function handleGlobalClick(event) {
  if (isPolicyLinkClick(event.target)) {
    return;
  }
  /* Не закрывать куки при клике по рекламной плашке VK */
  if (event.target.closest('#rec2317813501')) {
    return;
  }
  saveConsent();
  hideBanner();
}
</script>

<!-- Или весь блок handleGlobalClick + isPolicyLinkClick если удобнее скопировать целиком: -->

<script>
function isPolicyLinkClick(element) {
  var current = element;
  while (current && current !== document.body) {
    if (current.classList && current.classList.contains('cookie-banner-link')) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

function handleGlobalClick(event) {
  if (isPolicyLinkClick(event.target)) {
    return;
  }
  var cookieBanner = document.querySelector('.cookieBanner');
  if (!cookieBanner || !cookieBanner.contains(event.target)) {
    return;
  }
  saveConsent();
  hideBanner();
}
</script>

<!-- Вариант 2 (рекомендуется): куки закрываются только при клике ВНУТРИ блока cookie,
     а не при любом клике на странице. Так плашка VK и остальной сайт не трогают куки. -->
