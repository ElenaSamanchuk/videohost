# Videohost

Современный кинопортал на **React + Vite + TanStack Query + Tailwind**.

**Live:** [elenasamanchuk.github.io/videohost](https://elenasamanchuk.github.io/videohost/)

## UX

- **Каталог** — hero с топ-фильмом, сетка карточек, поиск
- **Страница просмотра** — кинотеатральный плеер, плейлист роликов (трейлер / тизер / клип)
- **Где смотреть полностью** — переход на Kinopoisk для лицензионного просмотра

На сайте встроены **трейлеры и ролики** из Kinopoisk API (YouTube). Полные фильмы API не отдаёт — для них блок «Где смотреть».

## Run locally

```bash
cp .env.example .env
npm install
npm run dev
```

## Stack

- React 18 + React Router
- TanStack Query
- Tailwind CSS 3
- Kinopoisk Unofficial API
