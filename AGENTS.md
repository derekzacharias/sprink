# Repository Guidelines

## Project Structure & Module Organization
- Source lives under `src/`; tests under `tests/`; scripts under `scripts/`; docs in `docs/`. Place example data in `examples/` and static assets in `assets/`.
- Mirror code structure in tests (e.g., `src/utils/parse.ts` → `tests/utils/parse.spec.ts` or `tests/utils/test_parse.py`).
- Keep modules focused and small. Prefer composition over large, multipurpose files.

## Build, Test, and Development Commands
- If a `Makefile` is present:
  - `make setup` – install tooling/deps
  - `make build` – compile or bundle
  - `make test` – run the test suite
  - `make lint` / `make fmt` – lint/format the code
  - `make run` – start the app locally
- Without Make:
  - Node: `npm ci`, `npm run build`, `npm test`, `npm run lint`, `npm start`
  - Python: `pip install -r requirements.txt`, `pytest -q`, `ruff check`, `black .`

## Coding Style & Naming Conventions
- Use an auto-formatter if configured; do not hand-format.
- Directories: `kebab-case`; files: language-idiomatic (`snake_case.py`, `kebab-case.ts`).
- Classes/Types: `PascalCase`; functions/vars: `camelCase` (JS/TS) or `snake_case` (Python).
- Keep functions <100 lines; prefer pure functions and clear names over comments.

## Testing Guidelines
- Co-locate or mirror tests in `tests/`. Name tests `*.spec.ts` / `*.test.ts` or `test_*.py`.
- Aim for meaningful coverage on changed code; include edge cases and failure paths.
- Run tests locally before pushing; add fixtures under `tests/fixtures/` when needed.

## Commit & Pull Request Guidelines
- Prefer Conventional Commits (e.g., `feat: add parser option`, `fix: handle empty input`).
- One logical change per commit; include rationale in the body if non-trivial.
- PRs: clear description, linked issues, screenshots for UI, steps to reproduce, and notes on tests/docs updates. Keep diffs small and focused.

## Security & Configuration
- Never commit secrets. Provide `.env.example` and document required vars.
- Pin dependencies when possible; avoid introducing new ones without discussion.
- Validate inputs at boundaries; add tests for security-sensitive code paths.

## Agent-Specific Instructions
- Keep changes minimal and surgical; avoid unrelated refactors.
- Update or add tests and docs when modifying behavior.
- Do not rename or move files unless necessary and justified in the PR.
