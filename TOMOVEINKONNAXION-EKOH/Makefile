# ---------- Make targets for local dev ---------- #

.PHONY: dev-up dev-down migrate shell lint test fmt \
        load-fixtures pre-commit

# spin up full stack
dev-up:
	docker compose -f docker-compose.dev.yml up --build -d

# stop stack
dev-down:
	docker compose -f docker-compose.dev.yml down

# Django helpers
migrate:
	docker compose exec app poetry run python manage.py migrate

shell:
	docker compose exec app poetry run python manage.py shell

load-fixtures:
	docker compose exec app poetry run python manage.py load_isced

# quality
lint:
	ruff check modules --fix
	black --check .

fmt:
	ruff check modules --fix
	black .

test:
	docker compose exec app poetry run pytest -q

# run pre-commit on all files (CI mirror)
pre-commit:
	pre-commit run --all-files
