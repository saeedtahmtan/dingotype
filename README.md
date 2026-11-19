# Dingotype

A fork of [Monkeytype](https://github.com/monkeytypegame/monkeytype) focused on
learning words in another language while you type, with a Persian interface.

**Live site: https://saeedtahmtan.github.io/dingotype/**

Everything runs in the browser. There is no backend, no account and no
telemetry: settings and results live in `localStorage`, and the site deploys as
plain static files to GitHub Pages.

# Features

- Everything from Monkeytype: test modes, quotes, themes, caret styles, funboxes
  and the command line
- Persian UI translation (Settings → language → interface language); text only,
  the layout stays LTR
- A `translation` funbox that shows the translation of each word as you type,
  plus per-language familiar / missed word statistics on the account page
- Offline: no server, no login, results and personal bests are kept locally

# Development

Requirements: Node `>=24 <25` and pnpm 11.

```sh
pnpm install
pnpm site        # frontend dev server on http://localhost:3000
```

`pnpm site` starts the frontend only. With no backend running, the app runs in
static mode (no server calls).

# Building

```sh
cd frontend
BASE_PATH=/dingotype/ BACKEND_URL= pnpm build
```

- `BACKEND_URL=` (empty) builds with no backend at all.
- `BASE_PATH` sets the deploy subpath. Use `/` for a domain root.
- Output goes to `frontend/dist`.

Preview the build with:

```sh
BASE_PATH=/dingotype/ pnpm site:preview   # http://localhost:4173/dingotype/
```

# Deployment

`.github/workflows/deploy-pages.yml` builds the frontend with
`BASE_PATH=/dingotype/` and publishes `frontend/dist` to GitHub Pages on every
push to `master` (or manually via `workflow_dispatch`).

Deep links are handled by `frontend/src/404.html`, which stores the requested
path and bounces it back to the app.

# Credits

This project is a fork of [Monkeytype](https://monkeytype.com), built by
[Miodec](https://github.com/miodec) and its
[contributors](https://github.com/monkeytypegame/monkeytype/graphs/contributors).
Thanks to [Montydrei](https://www.reddit.com/user/montydrei) for the original
name suggestion.

# License

[GPL-3.0](./LICENSE), same as Monkeytype.
