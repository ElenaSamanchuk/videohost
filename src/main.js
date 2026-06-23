import './styles.css';
import {
  fetchFilmDetails,
  fetchFilmVideos,
  fetchTopFilms,
  formatCountries,
  formatGenres,
  pickTrailer,
  ratingClass,
  searchFilms,
  youtubeEmbedUrl,
} from './api.js';

const filmGrid = document.getElementById('filmGrid');
const statusLine = document.getElementById('statusLine');
const sectionTitle = document.getElementById('sectionTitle');
const sectionHint = document.getElementById('sectionHint');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const filmModal = document.getElementById('filmModal');

let filmsCache = [];

function setStatus(text, isError = false) {
  if (!statusLine) return;
  statusLine.textContent = text;
  statusLine.classList.toggle('text-rose-400', isError);
  statusLine.classList.toggle('text-muted', !isError);
}

function filmTitle(film) {
  return film.nameRu || film.nameEn || film.nameOriginal || 'Без названия';
}

function renderGrid(films) {
  if (!filmGrid) return;
  filmsCache = films;

  if (!films.length) {
    filmGrid.innerHTML = '<p class="col-span-full text-sm text-muted">Ничего не найдено.</p>';
    setStatus('0 фильмов');
    return;
  }

  filmGrid.innerHTML = films
    .map(
      (film) => `
        <article class="film-card" data-film-id="${film.filmId}">
          <div class="relative">
            <img src="${film.posterUrlPreview || film.posterUrl || ''}" alt="" class="film-card__poster" loading="lazy" />
            ${
              film.rating && film.rating >= 0 && film.rating <= 10
                ? `<span class="${ratingClass(film.rating)}">${film.rating}</span>`
                : ''
            }
          </div>
          <div class="film-card__body">
            <h2 class="film-card__title">${filmTitle(film)}</h2>
            <p class="film-card__meta">${film.year ?? '—'} · ${formatGenres(film.genres)}</p>
          </div>
        </article>
      `,
    )
    .join('');

  setStatus(`${films.length} ${films.length === 1 ? 'фильм' : films.length < 5 ? 'фильма' : 'фильмов'}`);
}

async function loadTop() {
  sectionTitle.textContent = 'Популярное';
  sectionHint.textContent = 'Топ фильмов по рейтингу Kinopoisk';
  setStatus('Загрузка...');

  try {
    const data = await fetchTopFilms();
    renderGrid(data.films ?? []);
  } catch (error) {
    console.error(error);
    filmGrid.innerHTML = '<p class="col-span-full text-sm text-rose-400">Не удалось загрузить каталог. Проверьте API-ключ.</p>';
    setStatus('Ошибка загрузки', true);
  }
}

async function loadSearch(keyword) {
  sectionTitle.textContent = 'Поиск';
  sectionHint.textContent = `Результаты по запросу «${keyword}»`;
  setStatus('Поиск...');

  try {
    const data = await searchFilms(keyword);
    renderGrid(data.films ?? []);
  } catch (error) {
    console.error(error);
    setStatus('Ошибка поиска', true);
  }
}

function closeModal() {
  filmModal.classList.add('hidden');
  filmModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('overflow-hidden');
  filmModal.querySelector('.modal-panel').innerHTML = '';
}

async function openModal(filmId) {
  const panel = filmModal.querySelector('.modal-panel');
  filmModal.classList.remove('hidden');
  filmModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('overflow-hidden');

  panel.innerHTML = `
    <div class="p-6 sm:p-8 text-center text-sm text-muted">Загрузка фильма...</div>
  `;

  try {
    const [film, videosPayload] = await Promise.all([
      fetchFilmDetails(filmId),
      fetchFilmVideos(filmId),
    ]);

    const trailer = pickTrailer(videosPayload);
    const embedUrl = youtubeEmbedUrl(trailer?.url);
    const title = filmTitle(film);

    panel.innerHTML = `
      <button type="button" class="absolute top-4 right-4 z-10 btn-ghost" data-close-modal aria-label="Закрыть">✕</button>
      <div class="grid lg:grid-cols-[280px_1fr] gap-0">
        <div class="hidden lg:block p-6 border-r border-line/60">
          <img src="${film.posterUrl || film.posterUrlPreview || ''}" alt="" class="w-full rounded-2xl ring-1 ring-line object-cover aspect-[2/3]" />
        </div>
        <div class="p-6 sm:p-8 space-y-5">
          <div>
            <p class="text-xs uppercase tracking-wider text-muted mb-2">${formatGenres(film.genres)} · ${film.year ?? '—'}</p>
            <h2 id="modalTitle" class="text-2xl sm:text-3xl font-semibold tracking-tight">${title}</h2>
            <p class="text-sm text-muted mt-2">${formatCountries(film.countries)}${film.filmLength ? ` · ${film.filmLength} мин` : ''}</p>
          </div>

          ${
            embedUrl
              ? `<div class="player-frame" aria-label="Трейлер">
                  <iframe src="${embedUrl}" title="Трейлер: ${title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                </div>
                <p class="text-xs text-muted">${trailer?.name ? `Смотреть: ${trailer.name}` : 'Трейлер на YouTube'}</p>`
              : `<div class="player-frame flex items-center justify-center text-sm text-muted px-6 text-center">
                  Трейлер недоступен для встраивания. Откройте карточку на Kinopoisk.
                </div>`
          }

          <p class="text-sm leading-relaxed text-zinc-300">${film.description || 'Описание отсутствует.'}</p>

          <div class="flex flex-wrap gap-3 pt-2">
            ${
              film.webUrl
                ? `<a href="${film.webUrl}" target="_blank" rel="noreferrer" class="btn-primary">На Kinopoisk</a>`
                : ''
            }
            <button type="button" class="btn-ghost" data-close-modal>Закрыть</button>
          </div>
        </div>
      </div>
    `;

    panel.querySelectorAll('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', closeModal);
    });
  } catch (error) {
    console.error(error);
    panel.innerHTML = `
      <div class="p-8 text-center space-y-4">
        <p class="text-sm text-rose-400">Не удалось загрузить карточку фильма.</p>
        <button type="button" class="btn-ghost" data-close-modal>Закрыть</button>
      </div>
    `;
    panel.querySelector('[data-close-modal]')?.addEventListener('click', closeModal);
  }
}

filmGrid?.addEventListener('click', (event) => {
  const card = event.target.closest('[data-film-id]');
  if (!card) return;
  openModal(card.dataset.filmId);
});

filmModal?.addEventListener('click', (event) => {
  if (event.target === filmModal) closeModal();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !filmModal.classList.contains('hidden')) closeModal();
});

searchForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const keyword = searchInput?.value.trim();
  if (!keyword) {
    loadTop();
    return;
  }
  loadSearch(keyword);
});

loadTop();
