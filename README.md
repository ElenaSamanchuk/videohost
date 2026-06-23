# Videohost

Кинопортал на Kinopoisk Unofficial API: каталог, поиск, карточка фильма и **просмотр трейлера** в модалке.

**Live:** [elenasamanchuk.github.io/videohost](https://elenasamanchuk.github.io/videohost/)

## Run locally

```bash
cp .env.example .env
# add your Kinopoisk API key to .env
npm install
npm run dev
```

→ http://127.0.0.1:5181/

## Features

- Top popular films grid
- Search by title
- Film details modal with description
- Embedded YouTube trailer when available
- Link to Kinopoisk page

## Deploy

Set repository secret `KINOPOISK_API_KEY`, then push to `main`.
