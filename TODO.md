# Dingotype TODO

Progress for the Persian UI translation. Text-only (layout stays LTR), language
switcher lives in Settings → language → interface language.

## Done

- [x] i18n foundation: `frontend/src/ts/i18n/store.ts` (`t()`, signal,
      localStorage, `lang` attribute) + `fa.ts` dictionary.
- [x] Settings → language section with an interface language picker
      (english / فارسی), plus the word-list language moved there.
- [x] Central translation through shared components: `Button` text, `H2`/`H3`
      headings, setting titles, string setting descriptions, option labels,
      settings section titles.
- [x] Footer links, settings titles/options, main result labels (`tra`, `acc`),
      translation stats.
- [x] Multiple-meaning tooltip uses the native balloon mechanic and lists all
      meanings with the target emphasized.
- [x] Result screen translation-focused (`TRA` main stat instead of WPM).
- [x] Test notices translated (repeated, saving disabled, quick restart hints,
      zen/custom progress, blind/lazy/confidence, min speed/acc/burst, stop/delete
      on error, emulating layout, opposite shift, pace), plus out-of-focus
      warning.
- [x] Result secondary stats, words-history labels, result button balloons, and
      result line items (`test type`, `stop on …`, `invalid (…)`, etc.).

## Remaining

- [ ] Translate all setting descriptions (long strings in
      `frontend/src/ts/config/metadata.tsx`).
- [ ] Test config bar: verify every mode/option label (sourced from metadata)
      has a Persian entry.
- [ ] Test notices (`components/pages/test/modes-notice/*`), tooltips, warnings
      (caps lock, out of focus), live counters. **Mostly done** — see Done.
- [ ] Command line: lists, hints, search result descriptions.
- [ ] Result screen: secondary stats, chart labels, words history, replay,
      buttons, balloons. **Mostly done** — chart labels and replay remain.
- [ ] Account pages: profile, stats tables, charts, filters, import/export.
- [ ] Account settings page and its tabs.
- [ ] Modals: contact, support, cookies, "the rest", simple confirm modals.
- [ ] Notifications and validation/error messages.
- [ ] About, login, register, 404, leaderboard, profile pages.
- [ ] Static HTML pages (terms, privacy, security, warnings, email handler).
- [ ] Quick-nav / settings search keywords and aria-labels (translations should
      still be searchable in both languages).
- [ ] Brand strings that are intentionally left in English (logo, funbox names,
      key names, theme/font names).
- [ ] Spot-check that Persian strings don't overflow buttons on the test screen.
