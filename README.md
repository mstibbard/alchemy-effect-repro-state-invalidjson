# Alchemy Effect Repro

Rolling reproduction monorepo

`api` deploys a simple worker and dummy secret

- `/` create a task e.g., `curl <url>/ -H 'Content-Type: application/json' -d '{"title":"Fix stuff"}'`
- `/:id` retrieve a task by ID. Note: There is no persistence set up

`web` deploys a Tanstack Start app (default scaffolded code + alchemy stack). Connected via service binding to `api`
