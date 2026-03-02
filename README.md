# Gym Program

PWA-конструктор тренировки: один тренировочный день, список упражнений, управление сессией с таймерами отдыха, офлайн режим и установка на Android.

## Скрипты

```bash
npm install
npm run dev      # локальная разработка
npm run build    # production-сборка в dist/
npm run preview  # проверка собранного бандла
```

## Проверка PWA/офлайна
1. `npm run dev` и открыть `http://localhost:5173` в Chrome.
2. В DevTools → Application убедиться в наличии манифеста и сервис-воркера (vite-plugin-pwa).
3. Lighthouse → Progressive Web App: убедиться в статусе Installable & Offline capable.
4. Для Android: задеплойте сборку, откройте URL в Chrome, меню ⋮ → «Установить приложение», запустите и проверьте автономность (переключите устройство в авиарежим и перезапустите).

## Деплой
- **GitHub Pages**: соберите `npm run build`, задеплойте `dist/` на ветку `gh-pages`. При размещении на подпути задайте `base` в `vite.config.ts`.
- **Netlify**: Build Command `npm run build`, Publish Directory `dist`. После первого визита сервис-воркер закэширует shell для офлайна.
- **Vercel**: Framework Preset = Vite. Build `npm run build`, Output `dist`. Убедитесь, что домен совпадает со `start_url`.

## Android чеклист
1. Открыть прод-сайт в Chrome.
2. Добавить на главный экран (Standalone режим).
3. Начать тренировку, заблокировать/разблокировать устройство — таймер восстанавливается по timestamp.
4. Отключить сеть и перезапустить приложение: UI загружается из кэша, данные программы/сессии читаются из `localStorage`.
# gym-program
