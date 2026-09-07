# INOCYTE backend database

Django is the single ORM and migration system for both local SQLite and production PostgreSQL.

## Local development

Copy `.env.example` to `.env`. Keep `NODE_ENV=development` and leave `DATABASE_URL` unset. The database is created at `backend/data/inocyte.db`.

```sh
../venv/bin/python manage.py migrate
../venv/bin/python manage.py seed_superadmin
../venv/bin/python manage.py runserver
```

`seed_superadmin` reads `SUPERADMIN_NAME`, `SUPERADMIN_EMAIL`, and `SUPERADMIN_PASSWORD`, hashes the password through Django, and never replaces an existing Superadmin. Do not commit `.env`.

## Database commands

```sh
python manage.py migrate              # apply pending migrations
python manage.py makemigrations        # create migrations after model changes
python manage.py seed_superadmin       # safe initial account seed
python manage.py runserver             # local admin/API and Django admin at /admin/
```

There is no separate studio ORM in Django; use Django admin or a PostgreSQL client for inspection. Never use `flush`, `syncdb`, or destructive reset commands in production.

## Render production

Set `NODE_ENV=production`, `SECRET_KEY`, `ALLOWED_HOSTS`, and `CORS_ALLOWED_ORIGINS`. Render supplies `DATABASE_URL`; it must be a PostgreSQL URL. The Render build and start commands run only pending `migrate` operations before serving `config.wsgi:application` with Gunicorn. Existing data is preserved.
