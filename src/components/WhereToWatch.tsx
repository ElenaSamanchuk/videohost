type Props = {
  webUrl?: string;
  filmTitle: string;
};

export function WhereToWatch({ webUrl, filmTitle }: Props) {
  const kpUrl = webUrl || `https://www.kinopoisk.ru/index.php?kp_query=${encodeURIComponent(filmTitle)}`;

  return (
    <section id="where-to-watch" className="info-panel space-y-4 scroll-mt-28">
      <div>
        <h2 className="text-lg font-semibold">Где смотреть полностью</h2>
        <p className="text-sm text-muted mt-1">
          Полные фильмы лицензионно доступны на стримингах и в Kinopoisk. В демо-портале можно
          смотреть трейлеры и ролики прямо на сайте.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <a href={kpUrl} target="_blank" rel="noreferrer" className="rounded-2xl bg-surface ring-1 ring-line p-4 hover:ring-[color:var(--color-ring-hover)] transition-all">
          <p className="text-sm font-semibold">Kinopoisk</p>
          <p className="text-xs text-muted mt-1">Карточка фильма, подписка и онлайн-просмотр</p>
        </a>
        <div className="rounded-2xl bg-surface ring-1 ring-line p-4">
          <p className="text-sm font-semibold">На этом сайте</p>
          <p className="text-xs text-muted mt-1">Трейлеры, тизеры и клипы из API — в плеере выше</p>
        </div>
      </div>
    </section>
  );
}
