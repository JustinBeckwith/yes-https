# AGENTS.md

## Project overview

- This repository is a small ESM Node.js package that exports a single middleware from `lib/index.js`.
- Runtime support starts at Node.js 18 (`package.json`), and CI tests the package on Node.js 18, 20, and 22.
- Linting runs with Biome, and releases are managed through `release-please`.

## Working agreements

- Use `npm` for dependency and script commands.
- Prefer small, focused changes. Avoid unrelated cleanup in the same PR.
- Use Conventional Commits for commit messages and PR titles (for example: `fix: ...`, `feat: ...`, `docs: ...`). This repository uses `release-please`, so incorrect commit or PR prefixes can break release automation.
- Keep the public middleware API and the README example aligned when behavior or options change.
- Do not edit `CHANGELOG.md` or `.release-please-manifest.json` manually unless the task is explicitly about the release process.

## Commands

- Install dependencies: `npm install`
- Run tests: `npm test`
- Run lint: `npm run lint`
- Auto-fix formatting and lint issues: `npm run fix`
- Generate coverage report: `npm run coverage`

## Testing notes

- `npm test` runs with `NODE_ENV=production`, which is important because the middleware bypasses redirects outside production mode.
- HTTPS behavior is covered in `test/test.js` using the certificates under `test/certs/`.
- If you change request handling or HSTS behavior, update or extend tests in `test/test.js`.

## Files to check during changes

- `lib/index.js`: package implementation and exported middleware.
- `test/test.js`: behavioral coverage for redirects, HSTS headers, and ignored routes.
- `README.md`: user-facing API and usage examples.
- `example/app.js`: example app for manual testing and docs alignment.
